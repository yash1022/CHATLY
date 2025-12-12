import User from '../MODEL/Users.js';
import Session from '../MODEL/Session.js';
import bcrypt from 'bcrypt';
import {
  signAccessToken,
  generateRefreshTokenRaw,
  refreshTokenExpiryDate,
  hashToken,
  compareTokenHash
} from '../UTILS/token.js';
import { generateKeyPair } from '../UTILS/keyUtils.js';

/**
 * Cookie settings for refresh token
 * Using path '/auth' to limit scope; in production use secure: true and proper domain.
 */
const COOKIE_NAME = 'refreshToken';
const isProduction = process.env.NODE_ENV === 'production';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/'
};

// Register user
export async function register(req, res) {
  const { name , username , email, password , bio , ppurl } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  const existing = await User.findOne({ $or: [ { email }, { username } ] });
  if (existing) return res.status(409).json({ message: 'Email or username already in use' });

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const { publicKey, privateKey } = generateKeyPair();

  const user = new User({name , username , email , password: passwordHash , bio , ppUrl: ppurl || "" , publicKey });
  await user.save();
  res.status(201).json({ message: 'User created' });
}

// Login: issues access token and refresh token (cookie)
export async function login(req, res) {
  const { email, password, deviceName = 'unknown' } = req.body;
  const ip = req.ip;
  const ua = req.get('User-Agent') || '';

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  // create access token
  const accessToken = signAccessToken({ sub: user._id.toString() });

  // create refresh token raw and store hashed session (set _id to tokenId)
  const { tokenId, raw } = generateRefreshTokenRaw();
  const tokenHash = await hashToken(raw);
  const expiresAt = refreshTokenExpiryDate();

  const session = new Session({
    _id: tokenId,
    user: user._id,
    tokenHash,
    userAgent: ua,
    ipAddress: ip,
    expiresAt
  });
  await session.save();

  // set httpOnly cookie with raw refresh token (browser stores it)
  res.cookie(COOKIE_NAME, raw, { ...COOKIE_OPTIONS, expires: expiresAt });

  // return access token
  res.json({ accessToken });
}

// Refresh endpoint: rotates refresh token and issues a new access token
export async function refresh(req, res) {
  const raw = req.cookies[COOKIE_NAME];
  if (!raw)
    {
      console.log("NO REFRESH TOKEN PROVIDED");
       return res.status(401).json({ message: 'No refresh token' });
    }
      

  const parts = raw.split('.');
  const tokenId = parts[0];
  if (!tokenId) {
    res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
    return res.status(401).json({ message: 'Invalid token format' });
  }

  const session = await Session.findById(tokenId).populate('user');
  if (!session) {
    // unknown token - clear cookie and require login
    res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
    return res.status(401).json({ message: 'Invalid refresh token' });
  }

  // If already revoked -> reuse detection
  if (session.revokedAt) {
    // Reuse detected. Revoke all sessions for this user (security response).
    await Session.updateMany({ user: session.user._id }, { revokedAt: new Date() });
    // optionally set user's tokenInvalidBefore (not implemented here)
    res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
    return res.status(401).json({ message: 'Refresh token reuse detected. All sessions revoked.' });
  }

  // check expiry
  if (session.expiresAt < new Date()) {
    res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
    return res.status(401).json({ message: 'Refresh token expired, please sign in again' });
  }

  // verify token hash
  const ok = await compareTokenHash(raw, session.tokenHash);
  if (!ok) {
    res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
    return res.status(401).json({ message: 'Invalid refresh token' });
  }

  // rotate: mark current session revoked and create new session
  session.revokedAt = new Date();
  const { tokenId: newTokenId, raw: newRaw } = generateRefreshTokenRaw();
  const newHash = await hashToken(newRaw);
  const newExpiresAt = refreshTokenExpiryDate();

  const newSession = new Session({
    _id: newTokenId,
    user: session.user._id,
    tokenHash: newHash,
    userAgent: req.get('User-Agent') || '',
    ipAddress: req.ip,
    expiresAt: newExpiresAt
  });
  await newSession.save();

  session.replacedBy = newTokenId;
  await session.save();

  // issue new access token
  const accessToken = signAccessToken({ sub: session.user._id.toString()});

  // set cookie to new raw refresh token
  res.cookie(COOKIE_NAME, newRaw, { ...COOKIE_OPTIONS, expires: newExpiresAt });

  return res.json({ accessToken });
}

// Logout single session
export async function logout(req, res) {
  const raw = req.cookies[COOKIE_NAME];
  if (raw) {
    const parts = raw.split('.');
    const tokenId = parts[0];
    if (tokenId) {
      await Session.findByIdAndDelete(tokenId);
    }
  }
  res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
  return res.json({ message: 'Logged out' });
}


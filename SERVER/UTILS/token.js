import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'


const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN_DAYS = Number(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || 7);




export function signAccessToken(payload)
{
  return jwt.sign(payload, JWT_SECRET, {expiresIn: ACCESS_TOKEN_EXPIRES_IN});

}

export function verifyAccessToken(token)
{
  return jwt.verify(token, JWT_SECRET);
}

export function generateRefreshTokenRaw()
{
  const tokenId = uuidv4();
  const secret = crypto.randomBytes(40).toString('hex');
  return {
    tokenId ,
    raw: `${tokenId}.${secret}`
  }
}

export function refreshTokenExpiryDate()
{
  const date = new Date();
  date.setDate(date.getDate() + REFRESH_TOKEN_EXPIRES_IN_DAYS);
  return date;
}


export async function hashToken(token)
{
  const salt = await bcrypt.genSalt(10);
  const hashedToken = await bcrypt.hash(token, salt);
  return hashedToken;
}

export async function compareTokenHash(token,hash)
{
  return await bcrypt.compare(token, hash);
}



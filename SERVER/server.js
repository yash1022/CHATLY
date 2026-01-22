// Server entry point

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { connectDB } from './CONFIG/DB.js';
import authRoutes from './ROUTES/authRoutes.js';
import featureRoutes from './ROUTES/featureRoutes.js';
import cookieParser from 'cookie-parser';
import authMiddleware from './MIDDLEWARE/authMiddleware.js';
import initSocket from './SOCKET/socket_init.js';
import exchangeRoutes from './ROUTES/exchangeRoutes.js';
import { User } from './MODEL/Users.js';
import ConversationKey from './MODEL/ConversationKey.js';



// Connect to the database
connectDB();


const app = express();
const server = http.createServer(app);

// MIDDLEWARE

dotenv.config();

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin:"https://chatly-topaz.vercel.app",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
initSocket(server);

app.use('/auth', authRoutes);
app.use('/feature',authMiddleware, featureRoutes);
app.use('/exchange', authMiddleware, exchangeRoutes);

app.get('/me',authMiddleware, (req,res)=>{
  try{
    res.json(req.user);
  }
  catch(err)
  {
    res.status(500).json({message:'Server error'});
  }
  
})

app.put('/me', authMiddleware, async (req, res) => {
  try {
    const { name, username, bio, ppUrl } = req.body;
    const updateData = {};

    if (typeof name === 'string') updateData.name = name.trim();
    if (typeof username === 'string') updateData.username = username.trim();
    if (typeof bio === 'string') updateData.bio = bio;
    if (typeof ppUrl === 'string') updateData.ppUrl = ppUrl.trim();

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided' });
    }

    if (updateData.username) {
      const existingUser = await User.findOne({
        username: updateData.username,
        _id: { $ne: req.user._id }
      });

      if (existingUser) {
        return res.status(409).json({ message: 'Username already taken' });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    return res.json(updatedUser);
  } catch (err) {
    console.error('Profile update failed:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});


const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
setInterval(async () => {
  try {
    await ConversationKey.cleanupUnusedKeys(24);
  } catch (err) {
    console.error('ConversationKey cleanup failed:', err);
  }
}, CLEANUP_INTERVAL_MS);







// Server entry point

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { connectDB } from './CONFIG/DB.js';
import authRoutes from './ROUTES/authRoutes.js';
import cookieParser from 'cookie-parser';
import authMiddleware from './MIDDLEWARE/authMiddleware.js';



// Connect to the database
connectDB();


const app = express();
const server = http.createServer(app);

// MIDDLEWARE

dotenv.config();
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/auth', authRoutes);

app.get('/me',authMiddleware, (req,res)=>{
  try{
    res.json(req.user);
  }
  catch(err)
  {
    res.status(500).json({message:'Server error'});
  }
  
})


const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});







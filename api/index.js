import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

mongoose.connect(process.env.MONGO).then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
  });

// Middleware - ORDER MATTERS!
app.use(express.json());
app.use(cookieParser());

// CSP Middleware - Allow fonts, styles, scripts, images, and API connections
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: https:; connect-src 'self' https:;"
  );
  next();
});

// Routes
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use('/api/listing', listingRouter); // Assuming listingRouter is defined elsewhere

// JSON parse error handling
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: err.message
    });
  }
  next(err);
});

// General error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json({
    success: false, 
    statusCode, // ✅ Simplified (no need to repeat)
    message
  });
});

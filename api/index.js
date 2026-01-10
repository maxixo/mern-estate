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

// Path to client's dist directory
const clientDistPath = path.resolve(__dirname, '../client/dist');

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

// Serve static files from client/dist directory
app.use(express.static(clientDistPath));

// API routes
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use('/api/listing', listingRouter);

// SPA fallback - serve index.html for all non-API, non-static routes
app.use((req, res, next) => {
  // If the request is for an API route, skip this handler
  if (req.path.startsWith('/api')) {
    return next();
  }
  // If the file exists as a static file, skip this handler
  if (req.accepts('html') && !req.path.includes('.')) {
    // Serve index.html for client-side routing
    res.sendFile(path.join(clientDistPath, 'index.html'));
  } else {
    next();
  }
});

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

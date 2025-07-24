import express from 'express';
import mongoose from 'mongoose';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import User from './model/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import cors from 'cors';

dotenv.config();

const app = express();

// Enhanced request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Database connection with retry logic
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODBURI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    // Retry after 5 seconds
    setTimeout(connectMongoDB, 5000);
  }
};

connectMongoDB();

// PostgreSQL connection with error handling
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT),
  ssl: { rejectUnauthorized: false }
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL client error:', err.message);
});

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Original authenticateToken middleware (unchanged)
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    console.log('❌ No token found in cookies');
    return res.status(401).send({ error: 'Access Denied: No token provided' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    console.error('❌ Invalid Token:', err.message);
    res.status(403).send({ error: 'Invalid Token' });
  }
};

// Original endpoints below - kept exactly as you had them

// Root
app.get('/', (req, res) => {
  console.log('🔔 Root endpoint hit');
  res.send({ message: 'API is running. Try /api/signup or /api/login' });
});

// Signup
app.post('/api/signup', async (req, res) => {
  console.log('🔔 /api/signup hit');
  console.log('📦 Request body:', req.body);

  const { firstname, lastname, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('⚠️ Email already registered:', email);
      return res.status(409).send({ error: 'Email already registered' });
    }

    const newUser = new User({ firstname, lastname, email: email.toLowerCase(), password });
    await newUser.save();

    console.log('✅ New user created:', email);
    res.send({ success: true, message: 'User registered successfully' });
  } catch (err) {
    console.error('❌ Signup error:', err);
    res.status(500).send({ error: err.message || 'Failed to register user' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  console.log('🔔 /api/login hit');
  console.log('📦 Request body:', req.body);

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('⚠️ User not found for email:', email);
      return res.status(401).send({ error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log('⚠️ Password mismatch for user:', email);
      return res.status(401).send({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, firstname: user.firstname },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600000, // 1 hour
    });

    console.log('✅ User authenticated:', email);
    res.send({
      success: true,
      message: 'Authenticated',
      user: {
        email: user.email,
        firstname: user.firstname,
      },
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).send({ error: err.message || 'Login failed' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  console.log('🔔 /api/logout hit');
  res.clearCookie('token');
  res.send({ success: true, message: 'Logged out successfully' });
});

// PostgreSQL data (protected)
app.get('/api/data', authenticateToken, async (req, res) => {
  console.log('🔔 /api/data hit by user:', req.user.email);

  try {
    const result = await pool.query('SELECT * FROM "call summary"');
    res.send(result.rows);
  } catch (err) {
    console.error('❌ Data fetch error:', err);
    res.status(500).send({ error: err.message });
  }
});

// Update profile (protected)
app.put('/api/profile', authenticateToken, async (req, res) => {
  console.log('🔔 /api/profile update hit by user:', req.user.email);

  const { firstname, lastname, password } = req.body;

  try {
    const updates = {};
    if (firstname) updates.firstname = firstname;
    if (lastname) updates.lastname = lastname;
    if (password) updates.password = await bcrypt.hash(password, 10);

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).select('-password');

    console.log('✅ User profile updated:', updatedUser.email);
    res.send({ success: true, user: updatedUser });
  } catch (err) {
    console.error('❌ Profile update error:', err);
    res.status(500).send({ error: err.message });
  }
});

// Token validation (optional)
app.post('/api/validate-token', authenticateToken, (req, res) => {
  console.log('🔔 /api/validate-token hit by user:', req.user.email);
  res.send({
    firstname: req.user.firstname || 'User',
    email: req.user.email,
  });
});

// New debug endpoint (optional addition)
app.get('/api/debug', (req, res) => {
  res.send({
    headers: req.headers,
    cookies: req.cookies,
    environment: {
      node_env: process.env.NODE_ENV,
      mongodb_connected: mongoose.connection.readyState === 1
    }
  });
});

// Start server with enhanced error handling
const PORT = process.env.PORT || 6000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  }
});
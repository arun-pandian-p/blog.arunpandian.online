require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const Project = require('./models/Project');
const Blog = require('./models/Blog');
const Message = require('./models/Message');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
// 1. Projects Routes
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Blogs Routes
app.get('/api/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ publishedAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. Contact Submissions
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }
    const newMessage = new Message({ name, email, subject, message });
    await newMessage.save();
    res.status(201).json({ message: 'Message sent successfully! We will get back to you soon.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Root Route
app.get('/', (req, res) => {
  res.send('Arun Pandian Portfolio API running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const knex = require('knex');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database configuration will go here
const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'language_learning'
  }
});

// Sample API endpoint
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the Language Learning API!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

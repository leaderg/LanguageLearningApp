const express = require('express');
const cors = require('cors');
const app = express();

// In-memory data store
const memoryStore = {
  data: []
};

// Middleware
app.use(cors());
app.use(express.json());

// Sample API endpoint
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the Language Learning API!' });
});

// API endpoints for in-memory data
app.get('/api/data', (req, res) => {
  res.json(memoryStore.data);
});

app.post('/api/data', (req, res) => {
  const newItem = req.body;
  memoryStore.data.push(newItem);
  res.json(newItem);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

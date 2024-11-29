const express = require('express');
require('dotenv').config();
const path = require('path');
const mainRoutes = require('./routes/mainRoutes'); // Import mainRoutes

const app = express();

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware for serving static files
app.use(express.static(path.join(__dirname, '../public')));

// Use the main routes
app.use(mainRoutes);

// Example API endpoint (optional placeholder)
app.get('/api/data', (req, res) => {
    res.json({ message: 'Welcome to Project D API!' });
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start the server
const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
    console.log(`Project D is running on http://localhost:${PORT}`);
});

const express = require('express');
const axios = require('axios');
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

// Notify Project F that Project D is running
const notifyProjectF = async () => {
    try {
        await axios.post('http://localhost:3006/api/notifications', {
            message: 'Project D (Company IO) is up and running'
        });
        console.log('Notified Project F: Project D is running');
    } catch (error) {
        console.error('Failed to notify Project F:', error.message);
    }
};

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
    notifyProjectF(); // Send the notification when the server starts
});

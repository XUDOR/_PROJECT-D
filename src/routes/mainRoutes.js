const express = require('express');
const { Pool } = require('pg');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

// Database connection
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Function to notify Project F
async function notifyProjectF(message) {
    try {
        await axios.post('http://localhost:3006/api/notifications', { message });
        console.log(`Notified Project F: ${message}`);
    } catch (error) {
        console.error('Failed to notify Project F:', error.message);
    }
}

// ------------------- API STATUS ROUTE ------------------- //
router.get('/api/status', (req, res) => {
    res.json({
        status: 'active',
        version: '1.0',
        message: 'Project D (Company IO) is running'
    });
});

// ---------------- HEALTHCHECK ---------------- //

router.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'Project D is up and running' });
});


// Fetch all jobs
router.get('/api/jobs', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM jobs ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching jobs:', error.message);
        res.status(500).json({ error: 'Failed to fetch jobs.' });
    }
});

// Add a new job
router.post('/api/jobs', async (req, res) => {
    const { job_title, company_name, location, skills_required, job_description } = req.body;

    // Validation
    if (!job_title || !company_name) {
        return res.status(400).json({ error: 'Job title and company name are required.' });
    }

    try {
        const query = `
            INSERT INTO jobs (job_title, company_name, location, skills_required, job_description, created_at)
            VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *;
        `;
        const values = [job_title, company_name, location, skills_required, job_description];
        
        const result = await pool.query(query, values);

        // Notify Project F about new job
        await notifyProjectF(`New job posted: ${job_title} at ${company_name}`);

        // Store in json_store
        await pool.query(`INSERT INTO json_store (job_json) VALUES ($1)`, [result.rows[0]]);

        // Add JSON bundle notification
        await notifyProjectF(`JSON Bundle: Job data stored for ${job_title}`);

        // Send API message
        await axios.post('http://localhost:3006/api/messages', {
            message: `Job JSON bundle stored in database for: ${job_title}`
        });

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error inserting job:', error.message);
        await notifyProjectF(`Error posting job: ${error.message}`);
        res.status(500).json({ error: 'Failed to insert job.' });
    }
});

// Fetch all bundles
router.get('/api/bundles', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM user_job_bundles ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching bundles:', error.message);
        res.status(500).json({ error: 'Failed to fetch bundles.' });
    }
});

// Add a new bundle
router.post('/api/bundles', async (req, res) => {
    const bundleData = req.body;
    
    try {
        // Store job bundle and notify
        const result = await pool.query(
            `INSERT INTO json_store (user_json, job_json) VALUES (NULL, $1) RETURNING *`,
            [bundleData]
        );
        
        await notifyProjectF(`Job bundle created: ${bundleData.job_title} at ${bundleData.company_name}`);
        await axios.post('http://localhost:3006/api/messages', {
            message: `Job bundle stored in database for: ${bundleData.job_title}`
        });

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating bundle:', error.message);
        await notifyProjectF(`Error creating job bundle: ${error.message}`);
        res.status(500).json({ error: 'Failed to create bundle' });
    }
});

// Example placeholder endpoint
router.get('/api/data', (req, res) => {
    res.json({ message: 'Welcome to Project D API!' });
});

module.exports = router;
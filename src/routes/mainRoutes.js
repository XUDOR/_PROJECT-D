// mainRoutes.js 


const express = require('express');
const { Pool } = require('pg');
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

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error inserting job:', error.message);
        res.status(500).json({ error: 'Failed to insert job.' });
    }
});

// Example placeholder endpoint
router.get('/api/data', (req, res) => {
    res.json({ message: 'Welcome to Project D API!' });
});

module.exports = router;

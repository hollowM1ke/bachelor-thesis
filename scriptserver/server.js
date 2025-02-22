/* This file establishes the connection with the postgres. 
   Also, api endpoints are defined in this file for insertion, updation, deletion, visbility(to student) of the experiments.
*/
const express = require('express');
const dotenv = require("dotenv").config();
const { Client } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const validateToken = require('./auth-middleware/tokenValidation');
const checkPermission = require('./auth-middleware/hasPermission');
const app = express();
const port = 3333;

module.exports=app;

const client = new Client({
    user: process.env.REACT_APP_USER_NAME.toString(),
    host: process.env.REACT_APP_HOST.toString(),
    database: process.env.REACT_APP_DB.toString(),
    password: process.env.REACT_APP_DB_PASSWORD.toString(),
    port: process.env.REACT_APP_SERVER_PORT.toString()
});

app.use(bodyParser.json());

app.use(cors()); // This enables CORS for all routes

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-Requested-With, Accept');
    next();
});

app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.sendStatus(200);
});

async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to database');
    } catch (error) {
        throw error;
    }
}

// api's for CRUD operation
// Middleware to handle API requests
async function getExperiments() {
    app.get('/scriptApi/experiments', validateToken, checkPermission('experiments', 'read'), async (req, res) => {
        try {
            res.setHeader('Content-Type', 'application/json');
    
            // Check user role
            const userRole = req.headers.userrole;
    
            let query = 'SELECT * FROM labbook.experiments ORDER BY name ASC';
    
            // If user role is 's', filter experiments by visibility
            if (userRole === 'student') {
                query = 'SELECT * FROM labbook.experiments WHERE visibility = true ORDER BY name ASC';
            }
               
            const queryResult = await client.query(query);
            res.json(queryResult.rows);
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while processing your request' });
        }
    });
}

async function getPrograms() {
    app.get('/scriptApi/programs', validateToken, checkPermission('programs', 'read'), async (req, res) => {
        try {
            res.setHeader('Content-Type', 'application/json');
    
            // Check user role
            const userRole = req.headers.userrole;
    
            let query = '';
    
            // If user role is 's', filter experiments by visibility
            if (userRole === 'student') {
                query = 'SELECT * FROM labbook.programs WHERE visibility = true ORDER BY programs ASC';
            } else {
                query = 'SELECT * FROM labbook.programs ORDER BY programs ASC'
            }
               
            const queryResult = await client.query(query);
            res.json(queryResult.rows);
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while processing your request' });
        }
    });
}

async function insertPrograms() {
    app.post('/scriptApi/programs', validateToken, checkPermission('programs', 'create'), async (req, res) => {
        try {
            const { programs, visibility } = req.body;
            res.setHeader('Content-Type', 'application/json');
            // Insert data into labbook.experiments
            const query = 'INSERT INTO labbook.programs (programs, visibility) VALUES ($1, $2) RETURNING *';
            const values = [name, visibility];
            const queryResult = await client.query(query, values);
            res.status(201).json(queryResult.rows[0]); // Respond with the inserted data
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while processing your request' });
        }
    });
}

async function deletePrograms() {
    app.delete('/scriptApi/programs', validateToken, checkPermission('programs', 'delete'), async (req, res) => {
        try {
            const ProgramName = req.body.Programname;
            res.setHeader('Content-Type', 'application/json');

            // Delete the row from labbook.experiments
            const query = 'DELETE FROM labbook.programs WHERE programs = $1 RETURNING *';
            const values = [ProgramName];
            const queryResult = await client.query(query, values);

            if (queryResult.rows.length === 0) {
                res.status(404).json({ message: 'Program not found' });
            } else {
                res.status(200).json({ message: 'Program deleted successfully' });
            }
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while processing your request' });
        }
    });
}

async function updatePrograms() {
    app.put('/scriptApi/programs', validateToken, checkPermission('programs', 'update'), async (req, res) => {
        try {
            const oldExperimentName = req.body.Programname;
            const { newName, newVisibility } = req.body; // Include newVisibility from the request body
            res.setHeader('Content-Type', 'application/json');

            // Update the experiment in labbook.experiments
            const query = 'UPDATE labbook.programs SET programs = $1, visibility = $2 WHERE programs = $3 RETURNING *';
            const values = [newName, newVisibility, oldExperimentName]; // Include newVisibility in the values array
            const queryResult = await client.query(query, values);

            if (queryResult.rows.length === 0) {
                res.status(404).json({ message: 'Program not found' });
            } else {
                res.status(200).json(queryResult.rows[0]);
            }
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while processing your request' });
        }
    });
}

async function insertExperiment() {
    app.post('/scriptApi/experiments', validateToken, checkPermission('experiments', 'create'), async (req, res) => {
        try {
            const { name, jsonData, visibility } = req.body;
            res.setHeader('Content-Type', 'application/json');
            // Insert data into labbook.experiments
            const query = 'INSERT INTO labbook.experiments (name, json, visibility) VALUES ($1, $2, $3) RETURNING *';
            const values = [name, jsonData, visibility];
            const queryResult = await client.query(query, values);
            res.status(201).json(queryResult.rows[0]); // Respond with the inserted data
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while processing your request' });
        }
    });
}

async function deleteExperiment() {
    app.delete('/scriptApi/experiments', validateToken, checkPermission('experiments', 'delete'), async (req, res) => {
        try {
            const experimentName = req.body.experimentName;
            res.setHeader('Content-Type', 'application/json');

            // Delete the row from labbook.experiments
            const query = 'DELETE FROM labbook.experiments WHERE name = $1 RETURNING *';
            const values = [experimentName];
            const queryResult = await client.query(query, values);

            if (queryResult.rows.length === 0) {
                res.status(404).json({ message: 'Experiment not found' });
            } else {
                res.status(200).json({ message: 'Experiment deleted successfully' });
            }
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while processing your request' });
        }
    });
}

async function updateExperiment() {
    app.put('/scriptApi/experiments', validateToken, checkPermission('experiments', 'update'), async (req, res) => {
        try {
            const { newName, jsonData, newVisibility, oldExperimentName } = req.body; // Include newVisibility from the request body
            res.setHeader('Content-Type', 'application/json');

            // Update the experiment in labbook.experiments
            const query = 'UPDATE labbook.experiments SET name = $1, json = $2, visibility = $3 WHERE name = $4 RETURNING *';
            const values = [newName, jsonData, newVisibility, oldExperimentName]; // Include newVisibility in the values array
            const queryResult = await client.query(query, values);

            if (queryResult.rows.length === 0) {
                res.status(404).json({ message: 'Experiment not found' });
            } else {
                res.status(200).json(queryResult.rows[0]);
            }
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while processing your request' });
        }
    });
}

async function insertTimeStamps() {
    app.post('/scriptApi/timestamps', validateToken, checkPermission('timestamps', 'create'), async (req, res) => {
        try {
            const { userid, timestamp, checkboxid, experimentId } = req.body;   
            res.setHeader('Content-Type', 'application/json');

            // Insert data into labbook.timestamps
            const query = 'INSERT INTO labbook.timeInformation (userid, timestamp, checkboxid, experimentId) VALUES ($1, $2, $3, $4) RETURNING *';
            const values = [userid, timestamp, checkboxid, experimentId];
            const queryResult = await client.query(query, values);

            if (queryResult.rows.length === 0) {
                res.status(404).json({ message: 'Timestamp not found' });
            } else {
                res.status(200).json(queryResult.rows[0]);
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'An error occurred while processing your request' });
        }
    });
}

async function getTimeStamps() {
    app.get('/scriptApi/timestamps', validateToken, checkPermission('timestamps', 'read'), async (req, res) => {
        try {
            res.setHeader('Content-Type', 'application/json');
            
            let query = 'SELECT * FROM labbook.timeInformation ORDER BY timestamp ASC';

            const queryResult = await client.query(query);
            res.json(queryResult.rows);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'An error occurred while processing your request', error: error, errprMessage: error.message});
        }
    });
}

            

// Start the server
connectToDatabase().then(() => {
    app.listen(port, () => {
        getExperiments();
        insertExperiment();
        updateExperiment();
        deleteExperiment();
        getPrograms();
        insertPrograms();
        deletePrograms();
        updatePrograms();
        insertTimeStamps();
        getTimeStamps();
    });
});

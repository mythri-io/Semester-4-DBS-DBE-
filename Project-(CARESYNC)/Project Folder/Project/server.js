console.log("🔥🔥🔥 NEW SERVER FILE IS RUNNING 🔥🔥🔥");

import express from 'express';
import fs from 'fs';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Location of the JSON database
const DATA_FILE = path.join(
  __dirname,
  'src',
  'data',
  'initialData.json'
);

console.log("================================");
console.log("Database file location:");
console.log(DATA_FILE);
console.log("================================");

// GET patients
app.get('/api/patients', (req, res) => {
  console.log("GET /api/patients");

  try {
    // Check if file exists
    if (!fs.existsSync(DATA_FILE)) {
      console.error("DATABASE FILE NOT FOUND");
      console.error(DATA_FILE);

      return res.status(500).json({
        error: "Database file not found",
        file: DATA_FILE
      });
    }

    // Read file
    const rawData = fs.readFileSync(DATA_FILE, 'utf8');

    console.log("Database file read successfully");

    // Convert JSON to JavaScript
    const data = JSON.parse(rawData);

    console.log("JSON parsed successfully");

    // Make sure it is an array
    if (!Array.isArray(data)) {
      console.error("DATABASE IS NOT AN ARRAY");

      return res.status(500).json({
        error: "Database must contain an array"
      });
    }

    console.log("Patients found:", data.length);

    res.json(data);

  } catch (err) {
    console.error("================================");
    console.error("DATABASE ERROR:");
    console.error(err);
    console.error("================================");

    res.status(500).json({
      error: "Failed to read database file",
      details: err.message
    });
  }
});

// POST patients
app.post('/api/patients', (req, res) => {
  console.log("POST /api/patients");

  try {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify(req.body, null, 2)
    );

    console.log("Database file updated successfully!");

    res.json({
      success: true
    });

  } catch (err) {
    console.error("ERROR SAVING DATABASE:");
    console.error(err);

    res.status(500).json({
      error: "Failed to save to database file",
      details: err.message
    });
  }
});

// Start server
app.listen(3001, () => {
  console.log("--------------------------------");
  console.log("MediDocs Auto-Save Server");
  console.log("Server: http://localhost:3001");
  console.log("--------------------------------");
});


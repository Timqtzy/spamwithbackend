const express = require("express");
const mysql = require("mysql2"); // Ensure you're using mysql2 for better compatibility
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

// Load environment variables
require("dotenv").config();

// Create a connection to Aiven MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME, // Ensure you specify the database here
});

// Connect to the MySQL database
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to the MySQL server");

  // Ensure the table exists, or create it if it doesn't
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS tbluser (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      subscribe BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.query(createTableQuery, (err, result) => {
    if (err) {
      console.error("Error creating table:", err);
      return;
    }
    console.log("Table tbluser created or already exists");
  });
});

// Endpoint to add a user
app.post("/add_user", (req, res) => {
  const email = req.body.email;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const sql = "INSERT INTO tbluser (`email`, `subscribe`) VALUES (?, ?)";
  const values = [email, true];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.json({ message: "Something went wrong!" });
    }
    return res.json({ success: "Email added successfully!" });
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

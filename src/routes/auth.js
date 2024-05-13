const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();
const { getDb } = require("./../getdb");

// Register user
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const db = await getDb();
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query("INSERT INTO users (username, password) VALUES ($1, $2)", [
      username,
      hashedPassword,
    ]);
    res.status(201).send("User registered successfully");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const db = await getDb();
    const user = await db.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    if (user.rows.length === 0) {
      return res.status(401).send("Invalid Credentials");
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      user.rows[0].password
    );
    if (!isPasswordValid) {
      return res.status(401).send("Invalid Credentials");
    }
    const token = jwt.sign({ userId: user.rows[0].id }, "secret", {
      expiresIn: "1440h",
    });
    res.status(200).json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;

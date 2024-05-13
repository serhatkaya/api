const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();
const { getDb } = require("./../getdb");
const db = getDb();

// Register user
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashedPassword],
      (err) => {
        if (err) {
          console.error(err.message);
          return res.status(500).send("Server Error");
        }
        res.status(201).send("User registered successfully");
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    console.log("logee");
    const { username, password } = req.body;
    db.get(
      "SELECT * FROM users WHERE username = ?",
      [username],
      async (err, user) => {
        if (err) {
          console.error(err.message);
          return res.status(500).send("Server Error");
        }
        if (!user) {
          return res.status(401).send("Invalid Credentials");
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return res.status(401).send("Invalid Credentials");
        }
        const token = jwt.sign({ userId: user.id }, "secret", {
          expiresIn: "1440h",
        });
        res.status(200).json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;

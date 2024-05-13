const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { getDb } = require("./../getdb");

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).send("Unauthorized");
  }
  jwt.verify(token, "secret", (err, decoded) => {
    if (err) {
      return res.status(401).send("Unauthorized");
    }
    req.userId = decoded.userId;
    next();
  });
};

// Create Task
router.post("/", verifyToken, async (req, res) => {
  try {
    const { task_number, title, description, status } = req.body;
    const query = `
      INSERT INTO tasks (task_number, title, description, status)
      VALUES ($1, $2, $3, $4)
      RETURNING id`;
    const db = await getDb();
    const result = await db.query(query, [
      task_number,
      title,
      description,
      status,
    ]);
    const taskId = result.rows[0].id;
    res.status(201).json({ id: taskId });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Update Task
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const taskId = req.params.id;
    const query = `
      UPDATE tasks 
      SET title = $1, description = $2, status = $3 
      WHERE id = $4`;
    const db = await getDb();
    await db.query(query, [title, description, status, taskId]);
    res.status(200).send("Task updated successfully");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Delete Task
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const taskId = req.params.id;
    const query = `DELETE FROM tasks WHERE id = $1`;
    const db = await getDb();
    await db.query(query, [taskId]);
    res.status(200).send("Task deleted successfully");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Get Task by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const taskId = req.params.id;
    const query = `SELECT * FROM tasks WHERE id = $1`;
    const db = await getDb();
    const result = await db.query(query, [taskId]);
    const task = result.rows[0];
    if (!task) {
      return res.status(404).send("Task not found");
    }
    res.status(200).json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// List Tasks (Paginated)
router.get("/", verifyToken, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const offset = (page - 1) * limit;
    const query = `SELECT * FROM tasks LIMIT $1 OFFSET $2`;
    const db = await getDb();
    const result = await db.query(query, [limit, offset]);
    const tasks = result.rows;
    res.status(200).json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;

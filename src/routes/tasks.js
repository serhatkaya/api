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
    const userId = req.userId; // Get the authenticated user's ID
    const query = `
      INSERT INTO tasks (task_number, title, description, status, user_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id`;
    const db = await getDb();
    const result = await db.query(query, [
      task_number,
      title,
      description,
      status,
      userId, // Pass the user's ID to the query
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
    const userId = req.userId; // Get the authenticated user's ID
    const query = `
      UPDATE tasks 
      SET title = $1, description = $2, status = $3 
      WHERE id = $4 AND user_id = $5`; // Add condition for user_id
    const db = await getDb();
    const result = await db.query(query, [
      title,
      description,
      status,
      taskId,
      userId,
    ]);
    if (result.rowCount === 0) {
      // If no rows were updated (task not found or not owned by user)
      return res.status(404).send("Task not found or unauthorized");
    }
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
    const userId = req.userId; // Get the authenticated user's ID
    const query = `DELETE FROM tasks WHERE id = $1 AND user_id = $2`; // Add condition for user_id
    const db = await getDb();
    const result = await db.query(query, [taskId, userId]);
    if (result.rowCount === 0) {
      // If no rows were deleted (task not found or not owned by user)
      return res.status(404).send("Task not found or unauthorized");
    }
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
    const userId = req.userId; // Get the authenticated user's ID
    const query = `SELECT * FROM tasks WHERE id = $1 AND user_id = $2`; // Add condition for user_id
    const db = await getDb();
    const result = await db.query(query, [taskId, userId]);
    const task = result.rows[0];
    if (!task) {
      return res.status(404).send("Task not found or unauthorized");
    }
    res.status(200).json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const offset = (page - 1) * limit;
    const userId = req.userId; // Get the authenticated user's ID

    // Query to get total count
    const totalCountQuery = `SELECT COUNT(*) AS total_count FROM tasks WHERE user_id = $1`; // Add condition for user_id
    const db = await getDb();
    const totalCountResult = await db.query(totalCountQuery, [userId]);
    const totalCount = parseInt(totalCountResult.rows[0].total_count);

    // Query to fetch tasks for the current page
    const tasksQuery = `SELECT * FROM tasks WHERE user_id = $1 LIMIT $2 OFFSET $3`; // Add condition for user_id
    const tasksResult = await db.query(tasksQuery, [userId, limit, offset]);
    const tasks = tasksResult.rows;

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      total: totalCount,
      totalPages: totalPages,
      result: tasks,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;

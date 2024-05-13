const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { getDb } = require("./../getdb");
const db = getDb();

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
router.post("/", verifyToken, (req, res) => {
  const { task_number, title, description, status } = req.body;
  db.run(
    "INSERT INTO tasks (task_number, title, description, status) VALUES (?, ?, ?, ?)",
    [task_number, title, description, status],
    function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).send("Server Error");
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Update Task
router.put("/:id", verifyToken, (req, res) => {
  const { title, description, status } = req.body;
  db.run(
    "UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?",
    [title, description, status, req.params.id],
    function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).send("Server Error");
      }
      res.status(200).send("Task updated successfully");
    }
  );
});

// Delete Task
router.delete("/:id", verifyToken, (req, res) => {
  db.run("DELETE FROM tasks WHERE id = ?", req.params.id, function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Server Error");
    }
    res.status(200).send("Task deleted successfully");
  });
});

// Get Task by ID
router.get("/:id", verifyToken, (req, res) => {
  db.get("SELECT * FROM tasks WHERE id = ?", req.params.id, (err, task) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Server Error");
    }
    if (!task) {
      return res.status(404).send("Task not found");
    }
    res.status(200).json(task);
  });
});

// List Tasks (Paginated)
router.get("/", verifyToken, (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const offset = (page - 1) * limit;
  db.all(
    "SELECT * FROM tasks LIMIT ? OFFSET ?",
    [limit, offset],
    (err, tasks) => {
      if (err) {
        console.error(err.message);
        return res.status(500).send("Server Error");
      }
      res.status(200).json(tasks);
    }
  );
});

module.exports = router;

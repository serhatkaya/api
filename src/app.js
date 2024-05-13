const express = require("express");
const bodyParser = require("body-parser");
const { getDb } = require("./getdb");
getDb();

const authRoutes = require("./routes/auth");
const tasksRoutes = require("./routes/tasks");

const app = express();

// Middleware
app.use(bodyParser.json());

// Check if the database file exists
app.use("/auth", authRoutes);
app.use("/tasks", tasksRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

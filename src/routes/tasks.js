const express = require("express");
const pool = require("../config/db");

const router = express.Router();

const validStatuses = [
  "pending",
  "in_progress",
  "completed"
];

// Create a task
router.post("/", async (req, res, next) => {
  try {
    const { title, description = "" } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        error: "Task title is required"
      });
    }

    const [result] = await pool.execute(
      "INSERT INTO tasks (title, description) VALUES (?, ?)",
      [title.trim(), description]
    );

    res.status(201).json({
      id: result.insertId,
      title: title.trim(),
      description,
      status: "pending"
    });
  } catch (error) {
    next(error);
  }
});

// Get all tasks
router.get("/", async (req, res, next) => {
  try {
    const [tasks] = await pool.query(
      "SELECT * FROM tasks ORDER BY id DESC"
    );

    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// Update a task
router.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { title, description, status } = req.body;

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "Invalid task ID" });
    }

    if (
      title === undefined &&
      description === undefined &&
      status === undefined
    ) {
      return res.status(400).json({ error: "No updates provided" });
    }

    if (
      title !== undefined &&
      (typeof title !== "string" || !title.trim())
    ) {
      return res.status(400).json({ error: "Invalid title" });
    }

    if (
      description !== undefined &&
      typeof description !== "string"
    ) {
      return res.status(400).json({ error: "Invalid description" });
    }

    if (
      status !== undefined &&
      !validStatuses.includes(status)
    ) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push("title = ?");
      values.push(title.trim());
    }

    if (description !== undefined) {
      updates.push("description = ?");
      values.push(description);
    }

    if (status !== undefined) {
      updates.push("status = ?");
      values.push(status);
    }

    values.push(id);

    const [result] = await pool.execute(
      `UPDATE tasks SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    const [rows] = await pool.execute(
      "SELECT * FROM tasks WHERE id = ?",
      [id]
    );

    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

// Delete a task
router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "Invalid task ID" });
    }

    const [result] = await pool.execute(
      "DELETE FROM tasks WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
const express = require("express");
const tasksRouter = require("./routes/tasks");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "CloudDeploy API is running"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "UP"
  });
});

app.use("/api/tasks", tasksRouter);

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({
    error: "Internal server error"
  });
});

module.exports = app;
// app.js
const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(express.json());

const db = new sqlite3.Database("todoApplication.db");

// Create the 'todo' table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS todo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      todo TEXT,
      priority TEXT,
      status TEXT
    )
  `);
});

// API 1: Get todos based on filters
app.get("/todos", (req, res) => {
  const { status, priority, search_q } = req.query;
  let query = "SELECT * FROM todo WHERE 1";

  if (status) {
    query += ` AND status='${status}'`;
  }
  if (priority) {
    query += ` AND priority='${priority}'`;
  }
  if (search_q) {
    query += ` AND todo LIKE '%${search_q}%'`;
  }

  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// API 2: Get a specific todo by ID
app.get("/todos/:todoId", (req, res) => {
  const { todoId } = req.params;
  db.get(`SELECT * FROM todo WHERE id=${todoId}`, (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

// API 3: Create a new todo
app.post("/todos", (req, res) => {
  const { id, todo, priority, status } = req.body;
  const query = `INSERT INTO todo (id, todo, priority, status) VALUES (?, ?, ?, ?)`;
  db.run(query, [id, todo, priority, status], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.send("Todo Successfully Added");
  });
});

// API 4: Update a specific todo by ID
app.put("/todos/:todoId", (req, res) => {
  const { todoId } = req.params;
  const { status, priority, todo } = req.body;
  const updates = [];

  if (status) {
    updates.push(`status = '${status}'`);
  }
  if (priority) {
    updates.push(`priority = '${priority}'`);
  }
  if (todo) {
    updates.push(`todo = '${todo}'`);
  }

  if (updates.length === 0) {
    res.status(400).json({ error: "No valid updates provided" });
    return;
  }

  const query = `UPDATE todo SET ${updates.join(", ")} WHERE id = ?`;
  db.run(query, [todoId], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.send("Update Successful");
  });
});

// API 5: Delete a specific todo by ID
app.delete("/todos/:todoId", (req, res) => {
  const { todoId } = req.params;
  db.run(`DELETE FROM todo WHERE id = ?`, [todoId], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.send("Todo Deleted");
  });
});

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;

const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;
const FILE_PATH = path.join(__dirname, "students.json");

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files
const clientPath = path.join(__dirname, "../client");
app.use(express.static(clientPath));

// Get all students
app.get("/students", (req, res) => {
  fs.readFile(FILE_PATH, (err, data) => {
    if (err && err.code === "ENOENT") return res.json([]);
    if (err) return res.status(500).send("Error reading file");
    res.json(JSON.parse(data || "[]"));
  });
});

app.get("/students/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  fs.readFile(FILE_PATH, (err, data) => {
    if (err) return res.status(500).send("Error reading file");
    const students = JSON.parse(data || "[]");
    const student = students.find((s) => s.id === id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  });
});

// ✅ KEEP THIS AS THE LAST ROUTE
app.get("*", (req, res) => {
  res.sendFile(path.join(clientPath, "home.html"));
});

// Add new student with ID generation
app.post("/submit", (req, res) => {
  fs.readFile(FILE_PATH, (err, data) => {
    let students = [];
    if (!err && data.length > 0) students = JSON.parse(data);

    // Generate new id: max existing id + 1 or 1 if empty
    const newId =
      students.length > 0 ? Math.max(...students.map((s) => s.id)) + 1 : 1;

    const newStudent = { id: newId, ...req.body };

    students.push(newStudent);

    fs.writeFile(FILE_PATH, JSON.stringify(students, null, 2), (err) => {
      if (err) return res.status(500).send("Error saving data");
      res.json(newStudent);
    });
  });
});

// Delete student by ID
app.delete("/deleteStd/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  fs.readFile(FILE_PATH, (err, data) => {
    if (err) return res.status(500).send("Error reading file");
    let students = JSON.parse(data || "[]");
    const index = students.findIndex((s) => s.id === id);
    if (index === -1)
      return res.status(404).json({ message: "Student not found" });
    const deleted = students.splice(index, 1);
    fs.writeFile(FILE_PATH, JSON.stringify(students, null, 2), (err) => {
      if (err) return res.status(500).send("Error saving data");
      res.json({ message: "Student deleted", student: deleted[0] });
    });
  });
});

// Update student by ID
app.patch("/updateStd/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  fs.readFile(FILE_PATH, (err, data) => {
    if (err) return res.status(500).send("Error reading file");
    let students = JSON.parse(data || "[]");
    const index = students.findIndex((s) => s.id === id);
    if (index === -1)
      return res.status(404).json({ message: "Student not found" });
    students[index] = { ...students[index], ...req.body };
    fs.writeFile(FILE_PATH, JSON.stringify(students, null, 2), (err) => {
      if (err) return res.status(500).send("Error saving data");
      res.json({ message: "Student updated", student: students[index] });
    });
  });
});

// // Serve home.html for all other routes
// app.get("*", (req, res) => {
//   res.sendFile(path.join(clientPath, "home.html"));
// });

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);

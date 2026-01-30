import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.get("/high-school-test", async (req, res) => {
  try {
    const result = await connectionPool.query("SELECT * FROM assignments");

    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/high-school-test", async (req, res) => {
  try {
    const newAssignment = { ...req.body };

    // Validate required fields
    if (!newAssignment.title || !newAssignment.content || !newAssignment.category) {
      return res.status(400).json({ "message": "Server could not create assignment because there are missing data from client" });
    }

    console.log(newAssignment);

    await connectionPool.query("INSERT INTO assignments (title, content, category) VALUES ($1, $2, $3)", 
      [
        newAssignment.title,
        newAssignment.content,
        newAssignment.category,
      ]
    );
    return res.status(201).json({ "message": "Created assignment sucessfully" });
  } catch (error) {
    // Database connection or query error
    return res.status(500).json({ "message": "Server could not create assignment because database connection", error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});

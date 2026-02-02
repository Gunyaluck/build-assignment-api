import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.status(200).json("Server API is working 🚀");
});

//User สามารถดูข้อมูลแบบทดสอบทั้งหมดในระบบได้
app.get("/high-school-test", async (req, res) => {
  try {
    const result = await connectionPool.query("SELECT * FROM assignments");

    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).json({ "message": "Server could not read assignment because database connection", error: error.message });
  }
});

//User สามารถดูข้อมูลแบบทดสอบอันเดียวได้
app.get("/high-school-test/:assignmentId", async (req, res) => {

  try {
    const assignmentIdFromClient = req.params.assignmentId;
    const result = await connectionPool.query("SELECT * FROM assignments WHERE assignment_id = $1", [assignmentIdFromClient]);

    //ถ้าไม่พบข้อมูลในidนั้น
    if (!result.rows[0]) {
      return res.status(404).json({ "message": "Server could not find a requested assignment" });
    }
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ "message": "Server could not read assignment because database connection", error: error.message });
  }
});

//User สามารถแก้ไขแบบทดสอบที่ได้เคยสร้างไว้ก่อนหน้านี้
app.put("/high-school-test/:assignmentId", async (req, res) => {
  try {
    const assignmentIdFromClient = req.params.assignmentId;
    const updateAssignment = { ...req.body, updated_at: new Date() };
    await connectionPool.query("UPDATE assignments SET title = $2, content = $3, category = $4 WHERE assignment_id = $1", 
      [assignmentIdFromClient, 
        updateAssignment.title, 
        updateAssignment.content, 
        updateAssignment.category
      ]);
    return res.status(200).json({ "message": "Updated assignment sucessfully" });
  } catch (error) {
    return res.status(500).json({ "message": "Server could not update assignment because database connection", error: error.message });
  }
});

//User สามารถลบแบบทดสอบที่ได้เคยสร้างไว้ก่อนหน้านี้
app.delete("/high-school-test/:assignmentId", async (req, res) => {
  try {
    const assignmentIdFromClient = req.params.assignmentId;
    await connectionPool.query("DELETE FROM assignments WHERE assignment_id = $1", [assignmentIdFromClient]);
    return res.status(200).json({ "message": "Deleted assignment sucessfully" });
  } catch (error) {
    return res.status(500).json({ "message": "Server could not delete assignment because database connection", error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});

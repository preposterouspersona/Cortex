import express from "express";
const app = express();
import notesRoutes from "./routes/notesRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
app.use(cors());
app.use(express.json());
app.use("/api/notes", notesRoutes);
app.use("/api/ai", aiRoutes);
connectDB();

const server = app.listen(process.env.PORT, () => {
  console.log("server running on port", process.env.PORT);
});


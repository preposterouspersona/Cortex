import express from "express";
const router = express.Router();
import {getAllNotes, createNotes, updateNotes, deleteNotes, getNotesById} from "../controllers/notesController.js";

router.get("/", getAllNotes);

router.get("/:id", getNotesById);

router.post("/", createNotes);

router.put("/:id", updateNotes);

router.delete("/:id", deleteNotes);

export default router;

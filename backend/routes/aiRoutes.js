import express from "express";
import { generateTags, findLinks } from "../controllers/aiController.js";

const router = express.Router();

router.post("/tag", generateTags);
router.post("/link", findLinks);

export default router;

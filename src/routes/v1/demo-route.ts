import demo from "@/controllers/demo";
import express from "express";
const router = express.Router();

router.post("/", demo.extractText);

export default router;

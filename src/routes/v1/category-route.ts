import express from "express";
import categoryController from "@/controllers/category-controller";
import {authMiddleware} from "@/middleware/auth-middleware";

const router = express.Router();

router.get("/", authMiddleware.isAuthorized, categoryController.getCategories);
router.post("/", categoryController.pushMail);

export default router;

import express from "express";
import categoryController from "@/controllers/category-controller";
import {authMiddleware} from "@/middleware/auth-middleware";

const router = express.Router();

router.get("/", authMiddleware.isAuthorized, categoryController.getCategories);

export default router;

import express from "express";
import formController from "@/controllers/form-controller";
import {authMiddleware} from "@/middleware/auth-middleware";

const router = express.Router();

router.post("/", authMiddleware.isAuthorized, formController.createForm);

export default router;

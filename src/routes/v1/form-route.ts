import express from "express";
import formController from "@/controllers/form-controller";
import {authMiddleware} from "@/middleware/auth-middleware";

const router = express.Router();
router.use(authMiddleware.isAuthorized);

router.post("/", formController.createForm);
router.get("/", formController.getForms);

export default router;

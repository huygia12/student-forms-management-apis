import express from "express";
import formController from "@/controllers/form-controller";
import {authMiddleware} from "@/middleware/auth-middleware";
import {expressSchemaValidator} from "@/middleware/schema-validator";

const router = express.Router();
router.use(authMiddleware.isAuthorized);

router.post("/createForm", formController.createForm);
router.post("/", expressSchemaValidator("/forms"), formController.getForms);
router.patch(
    "/:id",
    authMiddleware.isAdmin,
    expressSchemaValidator("/forms/:id"),
    formController.udpateFormStatus
);

export default router;

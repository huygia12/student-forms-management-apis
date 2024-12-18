import express from "express";
import formController from "@/controllers/form-controller";
import {authMiddleware} from "@/middleware/auth-middleware";
import {expressSchemaValidator} from "@/middleware/schema-validator";

const router = express.Router();
router.use(authMiddleware.isAuthorized);

router.get("/:id", formController.getForm);
router.post(
    "/createForm",
    expressSchemaValidator("/createForm"),
    formController.createForm
);
router.post(
    "/uploadForm",
    expressSchemaValidator("/uploadForm"),
    formController.uploadForm
);
router.post(
    "/:id",
    expressSchemaValidator("/createForm"),
    formController.updateForm
);
router.delete("/:id", formController.deleteForm);
router.post("/", expressSchemaValidator("/forms"), formController.getForms);
router.patch(
    "/:id",
    authMiddleware.isAdmin,
    expressSchemaValidator("/forms/:id"),
    formController.updateFormStatus
);

export default router;

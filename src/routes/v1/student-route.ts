import express from "express";
import userController from "@/controllers/user-controller";
import {authMiddleware} from "@/middleware/auth-middleware";
import {expressSchemaValidator} from "@/middleware/schema-validator";

const router = express.Router();

router.post(
    "/signup",
    expressSchemaValidator("/students/signup"),
    userController.signupAsStudent
);
router.post(
    "/login",
    expressSchemaValidator("/students/login"),
    userController.loginAsStudent
);
router.get("/logout", userController.logoutAsStudent);
router.get("/refresh", userController.refreshStudentToken);
router.delete(
    "/:id",
    authMiddleware.isAuthorized,
    userController.deleteStudent
);
router.get("/:id", authMiddleware.isAuthorized, userController.getStudent);
router.get(
    "/",
    authMiddleware.isAuthorized,
    authMiddleware.isAdmin,
    userController.getStudents
);
router.put(
    "/:id",
    authMiddleware.isAuthorized,
    expressSchemaValidator("/students/:id"),
    userController.updateStudentInfo
);

export default router;

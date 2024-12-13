import express, {Request, Response} from "express";
import studentRoute from "@/routes/v1/student-route";
import adminRoute from "@/routes/v1/admin-route";
import formRoute from "@/routes/v1/form-route";
import {NextFunction} from "express-serve-static-core";

const router = express.Router();
const space = (req: Request, res: Response, next: NextFunction) => {
    console.log("\n");
    next();
};

router.use("/v1/students", space, studentRoute);
router.use("/v1/admins", space, adminRoute);
router.use("/v1/forms", space, formRoute);
router.get("/healthcheck", (req: Request, res: Response) =>
    res.sendStatus(200)
);
export const API_v1 = router;

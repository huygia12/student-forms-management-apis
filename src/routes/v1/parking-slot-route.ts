import express from "express";
import parkingSlotController from "@/controllers/parking-slot-controller";
import {expressSchemaValidator} from "@/middleware/schema-validator";
const router = express.Router();

router.get("/", parkingSlotController.getParkingSlots);
router.post("/", parkingSlotController.initParkingSlots);
router.put(
    "/",
    expressSchemaValidator("/parkingSlots"),
    parkingSlotController.updateParkingSlots
);

export default router;

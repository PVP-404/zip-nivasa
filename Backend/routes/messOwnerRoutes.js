import express from "express";
import { addMessOwner, getAllMessOwners } from "../controllers/messOwnerController.js";

const router = express.Router();

router.post("/add", addMessOwner);
router.get("/all", getAllMessOwners);

export default router;

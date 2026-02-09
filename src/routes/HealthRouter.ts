import express, { Router } from "express";
import { HealthController } from "../controllers/HealthController.js";

export const HealthRouter: Router = express.Router();

HealthRouter.route("/getHealth").get(HealthController.getHealth);
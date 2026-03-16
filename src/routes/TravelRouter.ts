import express, { Router } from "express";

import { TravelController } from "../controllers/TravelController.js";

export const TravelRouter: Router = express.Router();

TravelRouter.route("/beginTrip").post(TravelController.beginTrip);
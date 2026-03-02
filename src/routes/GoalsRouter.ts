import express, { Router } from "express";
import { GoalsController } from "../controllers/GoalsController.js";

export const GoalsRouter: Router = express.Router();

GoalsRouter.route("/createGoal").post(GoalsController.createGoal);
GoalsRouter.route("/updateGoalText").put(GoalsController.updateGoalText);
GoalsRouter.route("/markGoalAsComplete").put(GoalsController.markGoalAsComplete);
GoalsRouter.route("/getGoalsForDate").post(GoalsController.getGoalsForDate);
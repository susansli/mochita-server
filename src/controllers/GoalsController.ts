import { Request, Response } from "express";
import { ResponseCodes } from "../config/enums/ResponseCodes.js";
import { GoalModel } from "../models/GoalModel.js";
import { assertString } from "./asserts/asserts.js";

async function createGoal(req: Request, res: Response) {
  const { userId, date, text } = req.body;

  if (!assertString(userId) || !assertString(date) || !assertString(text)) {
    res.status(ResponseCodes.CLIENT_ERROR).send({
      errMsg: "There was a problem with the userId, date, or text parameters.",
    });
  } else {
    const response = await GoalModel.createGoal(userId, date, text);
    
    if (response === false) {
      res.status(ResponseCodes.CLIENT_ERROR).send({
        errorMsg: "The user has reached the maximum number of goals for this date.",
      });
    } else if (response) {
      res.status(ResponseCodes.OK).send({ goal: response });
    } else {
      res.status(ResponseCodes.API_ERROR).send({
        errorMsg: "There was a problem creating the goal.",
      });
    }
  }
}

async function updateGoalText(req: Request, res: Response) {
  const { goalId, text } = req.body;

  if (!assertString(goalId) || !assertString(text)) {
    res.status(ResponseCodes.CLIENT_ERROR).send({
      errMsg: "There was a problem with the goalId or text parameters.",
    });
  } else {
    const response = await GoalModel.updateGoalText(goalId, text);
    if (response) {
      res.status(ResponseCodes.OK).send({ goal: response });
    } else {
      res.status(ResponseCodes.API_ERROR).send({
        errorMsg: "There was a problem updating the goal text.",
      });
    }
  }
}

async function markGoalAsComplete(req: Request, res: Response) {
  const { goalId } = req.body;

  if (!assertString(goalId)) {
    res.status(ResponseCodes.CLIENT_ERROR).send({
      errMsg: "There was a problem with the goalId parameter.",
    });
  } else {
    const response = await GoalModel.markGoalAsComplete(goalId);
    if (response) {
      res.status(ResponseCodes.OK).send({ goal: response });
    } else {
      res.status(ResponseCodes.API_ERROR).send({
        errorMsg: "There was a problem marking the goal as complete.",
      });
    }
  }
}

async function getGoalsForDate(req: Request, res: Response) {
  const { userId, date } = req.body;

  if (!assertString(userId) || !assertString(date)) {
    res.status(ResponseCodes.CLIENT_ERROR).send({
      errMsg: "There was a problem with the userId or date parameters.",
    });
  } else {
    const response = await GoalModel.getGoalsForDate(userId, date);
    if (response) {
      res.status(ResponseCodes.OK).send({ goals: response });
    } else {
      res.status(ResponseCodes.API_ERROR).send({
        errorMsg: "There was a problem getting the goals.",
      });
    }
  }
}

export const GoalsController = {
  createGoal,
  updateGoalText,
  markGoalAsComplete,
  getGoalsForDate,
};
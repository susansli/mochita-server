import mongoose from "mongoose";
import { GoalEntrySchema } from "../config/schemas/GoalEntrySchema.js";
import { UserSchema } from "../config/schemas/UserSchema.js";
import { MAX_GOALS, JOURNAL_SPROUTS } from "../config/constants/contants.js";

async function createGoal(userId: string, date: string, text: string) {
  try {
    const userObjId = new mongoose.Types.ObjectId(userId);

    const existingGoals = await GoalEntrySchema.find({
      userId: userObjId,
      date: date,
    });

    if (existingGoals.length >= MAX_GOALS) {
      return false;
    }

    const nextIndex =
      existingGoals.length > 0
        ? Math.max(...existingGoals.map((g) => g.index)) + 1
        : 0;

    const newGoal = await GoalEntrySchema.create({
      userId: userObjId,
      date: date,
      text: text,
      isComplete: false,
      index: nextIndex,
    });

    if (!newGoal) {
      return null;
    }

    return newGoal;
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function updateGoalText(goalId: string, text: string) {
  try {
    const goalObjId = new mongoose.Types.ObjectId(goalId);

    const updatedGoal = await GoalEntrySchema.findByIdAndUpdate(
      goalObjId,
      { text: text },
      { new: true }
    );

    if (!updatedGoal) {
      return null;
    }

    return updatedGoal;
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function markGoalAsComplete(goalId: string) {
  try {
    const goalObjId = new mongoose.Types.ObjectId(goalId);

    const goal = await GoalEntrySchema.findById(goalObjId);

    if (!goal) {
      return null;
    }

    if (goal.isComplete) {
      return goal;
    }

    const updatedGoal = await GoalEntrySchema.findByIdAndUpdate(
      goalObjId,
      { isComplete: true },
      { new: true }
    );

    if (!updatedGoal) {
      return null;
    }

    const user = await UserSchema.findById(goal.userId);

    if (user) {
      await UserSchema.findByIdAndUpdate(
        user._id,
        { sprouts: user.sprouts + JOURNAL_SPROUTS },
        { new: true }
      );
    }

    return updatedGoal;
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function getGoalsForDate(userId: string, date: string) {
  try {
    const userObjId = new mongoose.Types.ObjectId(userId);

    const goals = await GoalEntrySchema.find({
      userId: userObjId,
      date: date,
    });

    if (!goals) {
      return null;
    }

    return goals.sort((a, b) => a.index - b.index);
  } catch (e) {
    console.error(e);
    return null;
  }
}

export const GoalModel = {
  createGoal,
  updateGoalText,
  markGoalAsComplete,
  getGoalsForDate,
};
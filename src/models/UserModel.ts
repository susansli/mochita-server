import mongoose from "mongoose";
import { User } from "../config/interfaces/User.js";
import { GoalEntrySchema } from "../config/schemas/GoalEntrySchema.js";
import { UserSchema } from "../config/schemas/UserSchema.js";
import { JournalEntrySchema } from "../config/schemas/JournalEntrySchema.js";
import { JournalTagRelationshipSchema } from "../config/schemas/JournalTagRelationshipSchema.js";

async function createUser(data: User) {
  try {
    const response = await UserSchema.create({
      ...data,
    });

    if (!response) {
      return null;
    }
    return response;
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function updateUser(data: User) {
  try {
    const response = await UserSchema.findByIdAndUpdate(data.id, {
      day: data.day,
      happiness: data.happiness,
      sprouts: data.sprouts,
    });

    if (!response) {
      return null;
    }
    return response;
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function getUser(id: string) {
  try {
    const response = await UserSchema.findById(id);

    if (!response) {
      return null;
    }
    return response;
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function deleteAllUserData(id: string) {
  try {
    const userId = new mongoose.Types.ObjectId(id);

    const userGoals = await GoalEntrySchema.find({
      userId: userId,
    });

    for (const goal of userGoals) {
      await GoalEntrySchema.findByIdAndDelete(goal._id);
    }

    const userJournalEntries = await JournalEntrySchema.find({
      userId: userId,
    });

    for (const entry of userJournalEntries) {
      const tags = await JournalTagRelationshipSchema.find({
        journalEntryId: entry._id,
      });

      if (tags.length) {
        for (const tag of tags) {
          await JournalTagRelationshipSchema.findByIdAndDelete(tag._id);
        }
      }

      await JournalEntrySchema.findByIdAndDelete(entry._id);
    }

    await UserSchema.findByIdAndDelete(userId);
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export const UserModel = {
  createUser,
  getUser,
  updateUser,
  deleteAllUserData,
};

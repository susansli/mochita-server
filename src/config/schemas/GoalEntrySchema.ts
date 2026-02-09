import mongoose from "mongoose";
import { stripAndFormatIds } from "../../utils/stripAndFormatIds.js";
import type { GoalEntry } from "../interfaces/GoalEntry.js";

const schema = new mongoose.Schema<GoalEntry>({
  userId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  isComplete: {
    type: Boolean,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
});

schema.plugin(stripAndFormatIds);

export const GoalEntrySchema = mongoose.model<GoalEntry>(
  "GoalEntry",
  schema,
);

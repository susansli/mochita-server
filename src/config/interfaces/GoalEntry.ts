import type mongoose from "mongoose";
import type { Identifiable } from "./Identifiable.js";

export interface GoalEntry extends Identifiable {
  userId: string | mongoose.Types.ObjectId;
  date: string;
  text: string;
  isComplete: boolean;
  index: number;
}

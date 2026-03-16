import mongoose from "mongoose";
import { Identifiable } from "./Identifiable.js";

export interface ChatMemory extends Identifiable {
  userId:  mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}
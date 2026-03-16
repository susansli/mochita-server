import mongoose from "mongoose";
import { stripAndFormatIds } from "../../utils/stripAndFormatIds.js";
import type { ChatMemory } from "../interfaces/ChatMemory.js";

const schema = new mongoose.Schema<ChatMemory>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

schema.plugin(stripAndFormatIds);

export const ChatMemorySchema = mongoose.model<ChatMemory>(
  "ChatMemory",
  schema,
);

import mongoose from "mongoose";
import { stripAndFormatIds } from "../../utils/stripAndFormatIds.js";
import type { UserContext } from "../interfaces/UserContext.js";

const schema = new mongoose.Schema<UserContext>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  context: {
    type: String,
    required: true,
  },
});

schema.plugin(stripAndFormatIds);

export const UserContextSchema = mongoose.model<UserContext>("UserContext", schema);

import mongoose from "mongoose";
import type { User } from "../interfaces/User.js";
import { MAX_CHAT_ROUNDS } from "../constants/contants.js";
import { stripAndFormatIds } from "../../utils/stripAndFormatIds.js";

const schema = new mongoose.Schema<User>({
  day: {
    type: Number,
    required: true,
  },
  happiness: {
    type: Number,
    required: true,
  },
  sprouts: {
    type: Number,
    required: true,
  },
  isTraveling: {
    type: Boolean,
    returned: true
  },
  chatRounds: {
    type: Number,
    required: true,
    default: MAX_CHAT_ROUNDS
  }
});

schema.plugin(stripAndFormatIds);

export const UserSchema = mongoose.model<User>("User", schema);

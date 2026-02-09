import mongoose from "mongoose";
import type { User } from "../interfaces/User.js";

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
});

// do not prune _id from User docs

export const UserSchema = mongoose.model<User>("User", schema);

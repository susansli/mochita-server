import mongoose from "mongoose";
import { stripAndFormatIds } from "../../utils/stripAndFormatIds.js";
import type { JournalTag } from "../interfaces/JournalTag.js";

const schema = new mongoose.Schema<JournalTag>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
});

schema.plugin(stripAndFormatIds);

export const JournalTagSchema = mongoose.model<JournalTag>(
  "JournalTag",
  schema,
);


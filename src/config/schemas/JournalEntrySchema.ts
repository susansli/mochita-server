import mongoose from "mongoose";
import { stripAndFormatIds } from "../../utils/stripAndFormatIds.js";
import type { JournalEntry } from "../interfaces/JournalEntry.js";

const schema = new mongoose.Schema<JournalEntry>({
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
});

schema.plugin(stripAndFormatIds);

export const JournalEntrySchema = mongoose.model<JournalEntry>(
  "JournalEntry",
  schema,
);

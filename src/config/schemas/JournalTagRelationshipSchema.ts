import mongoose from "mongoose";
import { stripAndFormatIds } from "../../utils/stripAndFormatIds.js";
import type { JournalTagRelationship } from "../interfaces/JournalTagRelationship.js";

const schema = new mongoose.Schema<JournalTagRelationship>({
  tagId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  journalEntryId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

schema.plugin(stripAndFormatIds);

export const JournalTagRelationshipSchema =
  mongoose.model<JournalTagRelationship>("JournalTagRelationship", schema);

import type mongoose from "mongoose";

export interface JournalTagRelationship {
    tagId: mongoose.Types.ObjectId,
    journalEntryId: mongoose.Types.ObjectId
}
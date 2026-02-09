import type mongoose from "mongoose";

export interface JournalTagRelationship {
    tagId: mongoose.Schema.Types.ObjectId,
    journalEntryId: mongoose.Schema.Types.ObjectId
}
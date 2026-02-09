import type mongoose from "mongoose";
import type { Identifiable } from "./Identifiable.js";
import type { JournalTag } from "./JournalTag.js";

export interface JournalEntry extends Identifiable {
    userId: string | mongoose.Schema.Types.ObjectId,
    date: string;
    text: string;
    tags?: JournalTag[];
}
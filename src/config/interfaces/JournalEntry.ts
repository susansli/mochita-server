import type { Identifiable } from "./Identifiable.js";
import type { JournalTag } from "./JournalTag.js";

export interface JournalEntry extends Identifiable {
    userId: number;
    date: string;
    text: string;
    tags?: JournalTag[];
}
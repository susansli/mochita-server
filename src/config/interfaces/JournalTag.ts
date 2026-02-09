import type mongoose from "mongoose";
import type { Identifiable } from "./Identifiable.js";

export interface JournalTag extends Identifiable {
    userId: string | mongoose.Schema.Types.ObjectId;
    label: string;
    value: string;
    color: string;
}
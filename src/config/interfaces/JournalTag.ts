import type mongoose from "mongoose";
import type { Identifiable } from "./Identifiable.js";

export interface JournalTag extends Identifiable {
    label: string;
    value: string;
    color: string;
}
import type { Identifiable } from "./Identifiable.js";

export interface JournalTag extends Identifiable {
    userId: number;
    label: string;
    value: string;
    color: string;
}
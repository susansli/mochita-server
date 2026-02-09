import type { Identifiable } from "./Identifiable.js";


export interface GoalEntry extends Identifiable {
    userId: number;
    date: string;
    text: string;
    isComplete: boolean;
    index: number;
}
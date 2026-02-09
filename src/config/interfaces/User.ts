import type { Identifiable } from "./Identifiable.js";

export interface User extends Identifiable {
    userId: number;
    day: number;
    happiness: number;
    sprouts: number;
}
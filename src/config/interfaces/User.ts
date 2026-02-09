import type mongoose from "mongoose";
import type { Identifiable } from "./Identifiable.js";

export interface User extends Identifiable {
    day: number;
    happiness: number;
    sprouts: number;
}


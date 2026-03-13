import mongoose from "mongoose";
import { Identifiable } from "./Identifiable.js";

export interface BagItemMetadata extends Identifiable {
    bagItemId: mongoose.Types.ObjectId,
    tripEndProbMod: number;
    tripRareProbMod: number;
    tripDurationMod: number;
    tripEventEasterEggProbMod: number;
}
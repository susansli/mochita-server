import mongoose from "mongoose";
import { Identifiable } from "./Identifiable.js";

export interface BagItemOwnership extends Identifiable {
    userId: string | mongoose.Types.ObjectId;
    bagItem: mongoose.Types.ObjectId;
    qty: number;
}
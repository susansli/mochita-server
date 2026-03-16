import mongoose from "mongoose";
import { Identifiable } from "./Identifiable.js";

export interface UserContext extends Identifiable {
    userId: mongoose.Types.ObjectId;
    context: string;
}
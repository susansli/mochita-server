import mongoose from "mongoose";
import { Identifiable } from "./Identifiable.js";

export interface Postcard extends Identifiable {
    userId: mongoose.Types.ObjectId;
    tripDataId: mongoose.Types.ObjectId;
    imageUrl: string;
    postcardText: string;
}
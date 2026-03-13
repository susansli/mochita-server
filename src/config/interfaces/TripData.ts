import mongoose from "mongoose";
import { Identifiable } from "./Identifiable.js";

export interface TripData extends Identifiable {
    userId: string | mongoose.Types.ObjectId;
    locationImgUrl: string;
    locationName: string;
    locationFlavorText: string;
    tripDuration: number;
    tripEndProb: number;
    tripEasterEggProb: number;
    currentTravelStageText: string;
    startDateString: string;
    endDateString?: string;
}
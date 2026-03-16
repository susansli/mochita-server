import mongoose from "mongoose";
import { TripData } from "../interfaces/TripData.js";
import { stripAndFormatIds } from "../../utils/stripAndFormatIds.js";

const schema = new mongoose.Schema<TripData>({
  userId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  locationImgUrl: {
    type: String,
    required: true,
  },
  locationName: {
    type: String,
    required: true,
  },
  locationFlavorText: {
    type: String,
    required: true,
  },
  tripDuration: {
    type: Number,
    required: true,
  },
  tripEndProb: {
    type: Number,
    required: true,
  },
  tripEasterEggProb: {
    type: Number,
    required: true,
  },
  currentTravelStageText: {
    type: String,
    required: true,
  },
  startDateString: {
    type: String,
    required: true,
  },
  endDateString: {
    type: String,
  },
  daysElapsed: {
    type: Number,
    required: true,
    default: 0,
  },
});

schema.plugin(stripAndFormatIds);

export const TripDataSchema = mongoose.model<TripData>(
  "TripData",
  schema,
);


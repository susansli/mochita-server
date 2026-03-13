import mongoose from "mongoose";
import { BagItemMetadata } from "../interfaces/BagItemMetadata.js";
import { stripAndFormatIds } from "../../utils/stripAndFormatIds.js";

const schema = new mongoose.Schema<BagItemMetadata>({
  bagItemId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  tripEndProbMod: {
    type: Number,
    required: true,
  },
  tripRareProbMod: {
    type: Number,
    required: true,
  },
  tripEventEasterEggProbMod: {
    type: Number,
    required: true,
  },
});

schema.plugin(stripAndFormatIds);

export const BagItemMetadataSchema = mongoose.model<BagItemMetadata>(
  "BagItemMetadata",
  schema,
);
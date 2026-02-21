import mongoose from "mongoose";
import type { BagItemOwnership } from "../interfaces/BagItemOwnership.js";
import { stripAndFormatIds } from "../../utils/stripAndFormatIds.js";

const schema = new mongoose.Schema<BagItemOwnership>({
  userId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  bagItem: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  qty: {
    type: Number,
    required: true,
  },
});

schema.plugin(stripAndFormatIds);

export const BagItemOwnershipSchema = mongoose.model<BagItemOwnership>(
  "BagItemOwnership",
  schema,
);

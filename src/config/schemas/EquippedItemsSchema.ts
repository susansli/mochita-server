import mongoose from "mongoose";
import type { EquippedItems } from "../interfaces/EquippedItems.js";
import { stripAndFormatIds } from "../../utils/stripAndFormatIds.js";

const schema = new mongoose.Schema<EquippedItems>({
  userId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  slot1: {
    type: mongoose.Types.ObjectId,
  },
  slot2: {
    type: mongoose.Types.ObjectId,
  },
  slot3: {
    type: mongoose.Types.ObjectId,
  },
  slot4: {
    type: mongoose.Types.ObjectId,
  },
});

schema.plugin(stripAndFormatIds);

export const EquippedItemsSchema = mongoose.model<EquippedItems>("EquippedItemsm", schema);

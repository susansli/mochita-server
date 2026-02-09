import mongoose from "mongoose";
import type { BagItem } from "../interfaces/BagItem.js";
import { stripAndFormatIds } from "../../utils/stripAndFormatIds.js";

const schema = new mongoose.Schema<BagItem>({
  name: {
    type: String,
    required: true,
  },
  imgUrl: {
    type: String,
    required: true,
  },
  type: {
    type: Number,
    required: true,
  },
  sproutCost: {
    type: Number,
  },
  qty: {
    type: Number,
  },
  happiness: {
    type: Number,
  },
});

schema.plugin(stripAndFormatIds);

export const BagItemSchema = mongoose.model<BagItem>("BagItem", schema);

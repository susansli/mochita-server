import mongoose from "mongoose";
import type { ItemType } from "../enums/ItemType.js";
import type { Identifiable } from "./Identifiable.js";

export interface BagItem extends Identifiable {
  userId: string | mongoose.Types.ObjectId;
  name: string;
  imgUrl: string;
  type: ItemType;
  sproutCost?: number;
  qty?: number;
  happiness?: number;
  effects: string[]; // need to derive from obj array, NOT in schema
}

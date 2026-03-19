import mongoose from "mongoose";
import type { ItemType } from "../enums/ItemType.js";
import type { Identifiable } from "./Identifiable.js";

export interface BagItem extends Identifiable {
  name: string;
  imgUrl: string;
  type: ItemType;
  sproutCost?: number;
  happiness?: number;
  flavorText: string;
  effectText: string;
}

import { ItemType } from "../enums/ItemType.js";

export interface InventoryItem {
  id: string;
  name: string;
  imgUrl: string;
  type: ItemType;
  sproutCost?: number;
  qty?: number;
  happiness?: number;
  flavorText: string;
  effectText: string;
}

import { ItemType } from "../enums/ItemType.js";

export interface InventoryItem {
  bagItemId: string;
  qty: number;
  name: string;
  imgUrl: string;
  type: ItemType;
  sproutCost?: number;
  happiness?: number;
  effects?: string[];
}

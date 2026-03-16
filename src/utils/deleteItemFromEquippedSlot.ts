import mongoose from "mongoose";
import { EquippedItems } from "../config/interfaces/EquippedItems.js";

export function deleteItemFromEquippedSlot(
  equippedItems: EquippedItems,
  slotItem: mongoose.Types.ObjectId,
) {
  const newEquippedItems = { ...equippedItems };

  if (newEquippedItems?.slot1 === slotItem) {
    delete newEquippedItems.slot1;
    return newEquippedItems;
  } else if (newEquippedItems?.slot2 === slotItem) {
    delete newEquippedItems.slot2;
    return newEquippedItems;
  } else if (newEquippedItems?.slot3 === slotItem) {
    delete newEquippedItems.slot3;
    return newEquippedItems;
  }

  delete newEquippedItems.slot4;
  return newEquippedItems;
}

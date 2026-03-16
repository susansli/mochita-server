import mongoose from "mongoose";
import { EquippedItems } from "../config/interfaces/EquippedItems.js";

export function fillNextEmptyEquippedSlot(
  equippedItems: EquippedItems,
  slotItem: mongoose.Types.ObjectId,
) {
  const newEquippedItems = { ...equippedItems };

  if (!newEquippedItems?.slot1) {
    newEquippedItems.slot1 = slotItem;
  } else if (!newEquippedItems?.slot2) {
    newEquippedItems.slot2 = slotItem;
  } else if (!newEquippedItems?.slot3) {
    newEquippedItems.slot3 = slotItem;
  } else {
    newEquippedItems.slot4 = slotItem;
  }
  return newEquippedItems;
}

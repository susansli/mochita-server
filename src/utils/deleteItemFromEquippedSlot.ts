import mongoose from "mongoose";
import { EquippedItems } from "../config/interfaces/EquippedItems.js";

export function deleteItemFromEquippedSlot(
  equippedItems: EquippedItems,
  slotItem: mongoose.Types.ObjectId,
) {
  const newEquippedItems = { ...equippedItems };

  if (newEquippedItems.slot1?.equals(slotItem)) {
    delete newEquippedItems.slot1;
  } else if (newEquippedItems.slot2?.equals(slotItem)) {
    delete newEquippedItems.slot2;
  } else if (newEquippedItems.slot3?.equals(slotItem)) {
    delete newEquippedItems.slot3;
  } else if (newEquippedItems.slot4?.equals(slotItem)) {
    delete newEquippedItems.slot4;
  }

  return newEquippedItems;
}
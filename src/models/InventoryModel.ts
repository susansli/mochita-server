import mongoose from "mongoose";
import { BagItemOwnershipSchema } from "../config/schemas/BagItemOwnershipSchema.js";
import { BagItemSchema } from "../config/schemas/BagItemSchema.js";
import { EquippedItemsSchema } from "../config/schemas/EquippedItemsSchema.js";
import { fillNextEmptyEquippedSlot } from "../utils/fillNextEmptyEquippedSlot.js";
import { deleteItemFromEquippedSlot } from "../utils/deleteItemFromEquippedSlot.js";

async function addBagItemOwnership(name: string, userId: string, qty: number) {
  try {
    const targetBagItem = await BagItemSchema.findOne({
      name: name,
    });

    if (!targetBagItem) {
      return null;
    }

    const newBagItemOwnership = await BagItemOwnershipSchema.create({
      userId: new mongoose.Types.ObjectId(userId),
      bagItem: targetBagItem._id,
      qty: qty,
    });

    if (!newBagItemOwnership) {
      return null;
    }

    return newBagItemOwnership;
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function updateBagItemOwnership(
  bagItemId: string,
  userId: string,
  qty: number,
) {
  try {
    if (qty === 0) {
      const deletedBagItemOwnership = await BagItemOwnershipSchema.deleteOne({
        bagItem: new mongoose.Types.ObjectId(bagItemId),
        userId: new mongoose.Types.ObjectId(userId),
      });

      if (!deletedBagItemOwnership) {
        return null;
      }

      return deletedBagItemOwnership;
    }

    const bagItemOwnership = await BagItemOwnershipSchema.findOne({
      bagItem: new mongoose.Types.ObjectId(bagItemId),
      userId: new mongoose.Types.ObjectId(userId),
      qty: qty,
    });

    if (!bagItemOwnership) {
      return null;
    }
    return bagItemOwnership;
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function equipBagItem(bagItemId: string, userId: string, qty: number) {
  try {
    const bagItemOwnership = await BagItemOwnershipSchema.findOneAndUpdate(
      {
        bagItem: new mongoose.Types.ObjectId(bagItemId),
        userId: new mongoose.Types.ObjectId(userId),
      },
      {
        qty: qty - 1,
      },
    );

    if (!bagItemOwnership) {
      return null;
    }

    if (qty === 1) {
      const deletedBagItemOwnership = await BagItemOwnershipSchema.deleteOne({
        bagItem: new mongoose.Types.ObjectId(bagItemId),
        userId: new mongoose.Types.ObjectId(userId),
      });

      if (!deletedBagItemOwnership) {
        return null;
      }
    }

    let equippedItems = await EquippedItemsSchema.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!equippedItems) {
      equippedItems = await EquippedItemsSchema.create({
        userId: new mongoose.Types.ObjectId(userId),
        slot1: bagItemOwnership.bagItem,
      });
    } else {
      const newEquippedItems = fillNextEmptyEquippedSlot(
        equippedItems,
        bagItemOwnership.bagItem,
      );

      const updatedEquippedItems = await EquippedItemsSchema.findOneAndUpdate(
        { _id: equippedItems._id },
        {
          ...newEquippedItems,
        },
      );

      if (!updatedEquippedItems) {
        return null;
      }

      return updatedEquippedItems;
    }
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function unequipBagItem(equippedItemsId: string, itemId: string) {
  try {
    const equippedItems = await EquippedItemsSchema.findById(equippedItemsId);

    if (!equippedItems) {
      return null;
    }

    const targetEquippedItems = deleteItemFromEquippedSlot(
      equippedItems,
      new mongoose.Types.ObjectId(itemId),
    );

    const updatedEquippedItem = await EquippedItemsSchema.findOneAndUpdate(
      { _id: equippedItemsId },
      {
        ...targetEquippedItems,
      },
    );

    if (!updatedEquippedItem) {
      return null;
    }

    const itemOwnership = await BagItemOwnershipSchema.findOne({
      userId: updatedEquippedItem.userId,
      bagItem: itemId,
    });

    let updatedItemOwnership;

    if (itemOwnership) {
      updatedItemOwnership = await BagItemOwnershipSchema.findByIdAndUpdate(
        itemOwnership._id,
        { qty: itemOwnership.qty + 1 },
      );
    } else {
        updatedItemOwnership = await BagItemOwnershipSchema.create({
            userId: updatedEquippedItem.userId,
            bagItem: itemId,
            qty: 1
        });
    }

    if (!updatedItemOwnership) {
        return null;
    }

    return updatedItemOwnership;

  } catch (e) {
    console.log(e);
    return null;
  }
}

export const InventoryModel = {
  addBagItemOwnership,
  updateBagItemOwnership,
  equipBagItem,
  unequipBagItem,
};

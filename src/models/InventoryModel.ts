import mongoose from "mongoose";
import { BagItemOwnershipSchema } from "../config/schemas/BagItemOwnershipSchema.js";
import { BagItemSchema } from "../config/schemas/BagItemSchema.js";
import { EquippedItemsSchema } from "../config/schemas/EquippedItemsSchema.js";
import { fillNextEmptyEquippedSlot } from "../utils/fillNextEmptyEquippedSlot.js";
import { deleteItemFromEquippedSlot } from "../utils/deleteItemFromEquippedSlot.js";
import { InventoryItem } from "../config/interfaces/InventoryItem.js";
import { BagItemOwnership } from "../config/interfaces/BagItemOwnership.js";

async function addBagItemOwnership(
  itemName: string,
  userId: string,
  qty: number,
) {
  try {
    const targetBagItem = await BagItemSchema.findOne({
      name: itemName,
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
  itemId: string,
  userId: string,
  qty: number,
) {
  try {
    if (qty === 0) {
      const deletedBagItemOwnership = await BagItemOwnershipSchema.deleteOne({
        bagItem: new mongoose.Types.ObjectId(itemId),
        userId: new mongoose.Types.ObjectId(userId),
      });

      if (!deletedBagItemOwnership) {
        return null;
      }

      return deletedBagItemOwnership;
    }

    const bagItemOwnership = await BagItemOwnershipSchema.findOne({
      bagItem: new mongoose.Types.ObjectId(itemId),
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

async function equipBagItem(itemId: string, userId: string, qty: number) {
  try {
    const bagItemOwnership = await BagItemOwnershipSchema.findOneAndUpdate(
      {
        bagItem: new mongoose.Types.ObjectId(itemId),
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
        bagItem: new mongoose.Types.ObjectId(itemId),
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
        qty: 1,
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

async function getAllStoreItems() {
  try {
    const storeItems = await BagItemSchema.find();
    if (!storeItems || !storeItems.length) {
      return null;
    }

    return storeItems;
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function getUserEquippedItems(userId: string) {
  try {
    let userEquippedItems = await EquippedItemsSchema.findOne({
      userId: userId,
    });

    if (!userEquippedItems) {
      userEquippedItems = await EquippedItemsSchema.create({ userId: userId });
    }

    if (!userEquippedItems) {
      return null;
    }
    return userEquippedItems;
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function getUserInventory(userId: string) {
  try {
    const userBagItemOwnerships: BagItemOwnership[] =
      await BagItemOwnershipSchema.find({ userId: userId });

    const userInventory: InventoryItem[] = [];

    for (const ownership of userBagItemOwnerships) {
      const bagItem = await BagItemSchema.findOne({ _id: ownership.bagItem });
      if (!bagItem) {
        return null;
      }
      const inventoryItem: InventoryItem = {
        bagItemId: ownership.bagItem.toString(),
        qty: ownership.qty,
        name: bagItem.name,
        imgUrl: bagItem.imgUrl,
        type: bagItem.type,
        effects: bagItem?.effects ? bagItem.effects : [],
      };

      if (bagItem?.sproutCost) {
        inventoryItem.sproutCost = bagItem.sproutCost;
      }

      if (bagItem?.happiness) {
        inventoryItem.happiness = bagItem.happiness;
      }

      userInventory.push(inventoryItem);

    }

    return userInventory;

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
  getAllStoreItems,
  getUserEquippedItems,
  getUserInventory,
};

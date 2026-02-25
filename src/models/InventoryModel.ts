import mongoose from "mongoose";
import { BagItemOwnershipSchema } from "../config/schemas/BagItemOwnershipSchema.js";
import { BagItemSchema } from "../config/schemas/BagItemSchema.js";
import { EquippedItemsSchema } from "../config/schemas/EquippedItemsSchema.js";
import { fillNextEmptyEquippedSlot } from "../utils/fillNextEmptyEquippedSlot.js";
import { deleteItemFromEquippedSlot } from "../utils/deleteItemFromEquippedSlot.js";
import { InventoryItem } from "../config/interfaces/InventoryItem.js";
import { BagItemOwnership } from "../config/interfaces/BagItemOwnership.js";
import { EquippedItems } from "../config/interfaces/EquippedItems.js";

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
    const bagItemObjId = new mongoose.Types.ObjectId(itemId);
    const userObjId = new mongoose.Types.ObjectId(userId);

    if (qty === 0) {
      const deletedBagItemOwnership = await BagItemOwnershipSchema.deleteOne({
        bagItem: bagItemObjId,
        userId: userObjId,
      });

      if (!deletedBagItemOwnership) {
        return null;
      }

      return deletedBagItemOwnership;
    }

    const bagItemOwnership = await BagItemOwnershipSchema.findOneAndUpdate(
      {
        bagItem: bagItemObjId,
        userId: userObjId,
      },
      {
        $set: { qty: qty }
      },
      { new: true }
    );

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
    const bagItemObjId = new mongoose.Types.ObjectId(itemId);
    const userObjId = new mongoose.Types.ObjectId(userId);

    const bagItemOwnership = await BagItemOwnershipSchema.findOneAndUpdate(
      {
        bagItem: bagItemObjId,
        userId: userObjId,
      },
      {
        qty: qty - 1,
      },
      { new: true } 
    );

    if (!bagItemOwnership) {
      return null;
    }

    if (qty === 1) {
      const deletedBagItemOwnership = await BagItemOwnershipSchema.deleteOne({
        bagItem: bagItemObjId,
        userId: userObjId,
      });

      if (!deletedBagItemOwnership) {
        return null;
      }
    }

    let equippedItems = await EquippedItemsSchema.findOne({
      userId: userObjId,
    }).lean<EquippedItems>();

    if (!equippedItems) {
      const newEquippedItems = await EquippedItemsSchema.create({
        userId: userObjId,
        slot1: bagItemOwnership.bagItem,
      });
      return newEquippedItems;
    } else {
      const newEquippedItems = fillNextEmptyEquippedSlot(
        equippedItems,
        bagItemOwnership.bagItem,
      );

      const updatedEquippedItems = await EquippedItemsSchema.findOneAndUpdate(
        { _id: equippedItems.id },
        {
          $set: newEquippedItems,
        },
        { new: true }
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
    const bagItemObjId = new mongoose.Types.ObjectId(itemId);
    
    const equippedItems = await EquippedItemsSchema.findById(equippedItemsId).lean<EquippedItems>();

    if (!equippedItems) {
      return null;
    }

    const targetEquippedItems = deleteItemFromEquippedSlot(
      equippedItems,
      bagItemObjId,
    );

    const updatedEquippedItem = await EquippedItemsSchema.findOneAndReplace(
      { _id: equippedItemsId },
      targetEquippedItems as EquippedItems,
      { new: true } 
    );

    if (!updatedEquippedItem) {
      return null;
    }

    const itemOwnership = await BagItemOwnershipSchema.findOne({
      userId: updatedEquippedItem.userId,
      bagItem: bagItemObjId,
    });

    let updatedItemOwnership;

    if (itemOwnership) {
      updatedItemOwnership = await BagItemOwnershipSchema.findByIdAndUpdate(
        itemOwnership._id,
        { qty: itemOwnership.qty + 1 },
        { new: true }
      );
    } else {
      updatedItemOwnership = await BagItemOwnershipSchema.create({
        userId: updatedEquippedItem.userId,
        bagItem: bagItemObjId,
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
    const userObjId = new mongoose.Types.ObjectId(userId);
    let userEquippedItems = await EquippedItemsSchema.findOne({
      userId: userObjId,
    });

    if (!userEquippedItems) {
      userEquippedItems = await EquippedItemsSchema.create({ userId: userObjId });
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
    const userObjId = new mongoose.Types.ObjectId(userId);
    const userBagItemOwnerships: BagItemOwnership[] =
      await BagItemOwnershipSchema.find({ userId: userObjId });

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
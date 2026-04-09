import mongoose from "mongoose";
import { BagItemOwnershipSchema } from "../config/schemas/BagItemOwnershipSchema.js";
import { BagItemSchema } from "../config/schemas/BagItemSchema.js";
import { EquippedItemsSchema } from "../config/schemas/EquippedItemsSchema.js";
import { fillNextEmptyEquippedSlot } from "../utils/fillNextEmptyEquippedSlot.js";
import { deleteItemFromEquippedSlot } from "../utils/deleteItemFromEquippedSlot.js";
import { InventoryItem } from "../config/interfaces/InventoryItem.js";
import { BagItemOwnership } from "../config/interfaces/BagItemOwnership.js";
import { EquippedItems } from "../config/interfaces/EquippedItems.js";
import { UserSchema } from "../config/schemas/UserSchema.js";
import { BagItem } from "../config/interfaces/BagItem.js";
import { ItemType } from "../config/enums/ItemType.js";

async function addBagItemOwnership(
  itemId: mongoose.Types.ObjectId,
  userId: string,
  qty: number,
) {
  try {
    const targetBagItem = await BagItemSchema.findOne({
      _id: itemId,
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
        $set: { qty: qty },
      },
      { new: true },
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

async function buyItem(itemId: string, userId: string, qty: number) {
  try {
    const userObjId = new mongoose.Types.ObjectId(userId);

    const userSchema = await UserSchema.findById(userObjId);

    if (!userSchema) {
      return null;
    }

    const itemObjId = new mongoose.Types.ObjectId(itemId);

    const bagItem = await BagItemSchema.findById(itemObjId);

    if (!bagItem) {
      return null;
    }

    if (bagItem?.sproutCost && userSchema.sprouts > bagItem.sproutCost * qty) {
      const updatedUserSchema = await UserSchema.findByIdAndUpdate(
        userSchema._id,
        {
          sprouts: userSchema.sprouts - bagItem.sproutCost * qty,
        },
      );

      if (!updatedUserSchema) {
        return null;
      }

      // check if the user already owns 1, if so then just update qty
      const existingBagItemOwnership = await BagItemOwnershipSchema.findOne({
        userId: userObjId,
        bagItem: itemObjId,
      });

      if (existingBagItemOwnership) {
        const updatedBagItemOwnership = await updateBagItemOwnership(
          itemId,
          userId,
          existingBagItemOwnership.qty + qty,
        );

        if (!updatedBagItemOwnership) {
          return null;
        } else {
          return await getUserInventory(userId); // updated inventory
        }
      }

      const newOwnership = await addBagItemOwnership(itemObjId, userId, qty);
      if (!newOwnership) {
        return null;
      }

      return await getUserInventory(userId);
    }

    return false; // means the user can't afford the transaction - null is an error
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function useTreat(itemId: string, userId: string, qty: number) {
  try {
    const userObjId = new mongoose.Types.ObjectId(userId);

    const userSchema = await UserSchema.findById(userObjId);

    if (!userSchema) {
      return null;
    }

    const itemObjId = new mongoose.Types.ObjectId(itemId);

    const bagItem = await BagItemSchema.findById(itemObjId);

    if (!bagItem) {
      return null;
    }

    if (bagItem?.happiness) {
      const updatedUserSchema = await UserSchema.findByIdAndUpdate(
        userSchema._id,
        {
          happiness: userSchema.happiness + bagItem.happiness,
        },
      );

      if (updatedUserSchema) {
        return await updateBagItemOwnership(itemId, userId, qty - 1);
      }
    }
    return null;
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function equipBagItem(itemId: string, userId: string, qty: number) {
  try {
    const bagItemObjId = new mongoose.Types.ObjectId(itemId);
    const userObjId = new mongoose.Types.ObjectId(userId);

    // create new equipped items obj to return to FE
    const returnedEquippedItems: { [key: string]: InventoryItem } = {};

    const bagItemOwnership = await BagItemOwnershipSchema.findOneAndUpdate(
      {
        bagItem: bagItemObjId,
        userId: userObjId,
      },
      {
        qty: qty - 1,
      },
      { new: true },
    );

    if (!bagItemOwnership) {
      return null;
    }

    let equippedItems = await EquippedItemsSchema.findOne({
      userId: userObjId,
    }).lean<EquippedItems>();

    if (!equippedItems) {
      const newEquippedItems = await EquippedItemsSchema.create({
        userId: userObjId,
        slot1: bagItemOwnership.bagItem,
      });

      if (!newEquippedItems || !newEquippedItems?.slot1) {
        return null;
      }

      const bagItem = await BagItemSchema.findOne({
        _id: newEquippedItems.slot1,
      });

      if (!bagItem) {
        return null;
      }

      const itemOwnership = await BagItemOwnershipSchema.findOne({
        userId: userObjId,
        bagItem: newEquippedItems.slot1,
      });

      if (!itemOwnership) {
        return null;
      } else {
        returnedEquippedItems[bagItem.type.toString()] = {
          id: newEquippedItems.slot1.toString(),
          name: bagItem.name,
          imgUrl: bagItem.imgUrl,
          type: bagItem.type,
          flavorText: bagItem.flavorText,
          effectText: bagItem.effectText,
          qty: itemOwnership.qty,
        };
      }

      if (bagItemOwnership.qty === 0) {
        const deletedBagItemOwnership =
          await BagItemOwnershipSchema.findByIdAndDelete(bagItemOwnership._id);
        if (!deletedBagItemOwnership) {
          return null;
        }
      }

      return returnedEquippedItems;
    } else {
      const newEquippedItems = fillNextEmptyEquippedSlot(
        equippedItems,
        bagItemOwnership.bagItem,
      );

      // Prevent MongoDB immutable field errors
      delete (newEquippedItems as any)._id;
      delete (newEquippedItems as any).__v;

      const updatedEquippedItems = await EquippedItemsSchema.findOneAndUpdate(
        { userId: userObjId }, // Target by userId instead of the undefined id virtual
        {
          $set: newEquippedItems,
        },
        { new: true },
      );

      if (!updatedEquippedItems) {
        return null;
      }

      // check if slot 1 is occupied, if so find the bag item details and add to returned equipped items obj
      // then have to find the ownership to get the qty
      if (updatedEquippedItems.slot1) {
        const bagItem = await BagItemSchema.findOne({
          _id: updatedEquippedItems.slot1,
        });

        if (!bagItem) {
          return null;
        }

        const itemOwnership = await BagItemOwnershipSchema.findOne({
          userId: userObjId,
          bagItem: updatedEquippedItems.slot1,
        });

        if (!itemOwnership) {
          return null;
        } else {
          returnedEquippedItems[bagItem.type.toString()] = {
            id: updatedEquippedItems.slot1.toString(),
            name: bagItem.name,
            imgUrl: bagItem.imgUrl,
            type: bagItem.type,
            flavorText: bagItem.flavorText,
            effectText: bagItem.effectText,
            qty: itemOwnership.qty,
          };
        }
      }

      // repeat for slots 2 - 4

      if (updatedEquippedItems.slot2) {
        const bagItem = await BagItemSchema.findOne({
          _id: updatedEquippedItems.slot2,
        });

        if (!bagItem) {
          return null;
        }

        const itemOwnership = await BagItemOwnershipSchema.findOne({
          userId: userObjId,
          bagItem: updatedEquippedItems.slot2,
        });

        if (!itemOwnership) {
          return null;
        } else {
          returnedEquippedItems[bagItem.type.toString()] = {
            id: updatedEquippedItems.slot2.toString(),
            name: bagItem.name,
            imgUrl: bagItem.imgUrl,
            type: bagItem.type,
            flavorText: bagItem.flavorText,
            effectText: bagItem.effectText,
            qty: itemOwnership.qty,
          };
        }
      }

      if (updatedEquippedItems.slot3) {
        const bagItem = await BagItemSchema.findOne({
          _id: updatedEquippedItems.slot3,
        });

        if (!bagItem) {
          return null;
        }

        const itemOwnership = await BagItemOwnershipSchema.findOne({
          userId: userObjId,
          bagItem: updatedEquippedItems.slot3,
        });

        if (!itemOwnership) {
          return null;
        } else {
          returnedEquippedItems[bagItem.type.toString()] = {
            id: updatedEquippedItems.slot3.toString(),
            name: bagItem.name,
            imgUrl: bagItem.imgUrl,
            type: bagItem.type,
            flavorText: bagItem.flavorText,
            effectText: bagItem.effectText,
            qty: itemOwnership.qty,
          };
        }
      }

      if (updatedEquippedItems.slot4) {
        const bagItem = await BagItemSchema.findOne({
          _id: updatedEquippedItems.slot4,
        });

        if (!bagItem) {
          return null;
        }

        const itemOwnership = await BagItemOwnershipSchema.findOne({
          userId: userObjId,
          bagItem: updatedEquippedItems.slot4,
        });

        if (!itemOwnership) {
          return null;
        } else {
          returnedEquippedItems[bagItem.type.toString()] = {
            id: updatedEquippedItems.slot4.toString(),
            name: bagItem.name,
            imgUrl: bagItem.imgUrl,
            type: bagItem.type,
            flavorText: bagItem.flavorText,
            effectText: bagItem.effectText,
            qty: itemOwnership.qty,
          };
        }
      }

      if (bagItemOwnership.qty === 0) {
        const deletedBagItemOwnership =
          await BagItemOwnershipSchema.findByIdAndDelete(bagItemOwnership._id);
        if (!deletedBagItemOwnership) {
          return null;
        }
      }

      return returnedEquippedItems;
    }
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function unequipBagItem(equippedItemsId: string, itemId: string) {
  try {
    const bagItemObjId = new mongoose.Types.ObjectId(itemId);

    const equippedItems =
      await EquippedItemsSchema.findById(equippedItemsId).lean<EquippedItems>();

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
      { new: true },
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
        { new: true },
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
      userEquippedItems = await EquippedItemsSchema.create({
        userId: userObjId,
      });
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
        id: ownership.bagItem.toString(),
        qty: ownership.qty,
        name: bagItem.name,
        imgUrl: bagItem.imgUrl,
        type: bagItem.type,
        flavorText: bagItem.flavorText,
        effectText: bagItem.effectText,
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
  buyItem,
  useTreat,
};

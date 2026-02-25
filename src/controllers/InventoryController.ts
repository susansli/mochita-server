import { Request, Response } from 'express';
import { ResponseCodes } from "../config/enums/ResponseCodes.js";
import { InventoryModel } from "../models/InventoryModel.js";
import { assertString, assertNumber } from "./asserts/asserts.js";

async function addBagItemOwnership(req: Request, res: Response) {
  const { itemName, userId, qty } = req.body;

  if (!assertString(itemName) || !assertString(userId) || !assertNumber(qty)) {
    res.status(ResponseCodes.CLIENT_ERROR).send({
      errMsg: "There was a problem with the itemName, userId, or qty parameters.",
    });
  } else {
    const response = await InventoryModel.addBagItemOwnership(itemName, userId, qty);
    if (response) {
      res.status(ResponseCodes.OK).send({ bagItemOwnership: response });
    } else {
      res.status(ResponseCodes.API_ERROR).send({
        errorMsg: "There was a problem adding the bag item ownership.",
      });
    }
  }
}

async function updateBagItemOwnership(req: Request, res: Response) {
  const { itemId, userId, qty } = req.body;

  if (!assertString(itemId) || !assertString(userId) || !assertNumber(qty)) {
    res.status(ResponseCodes.CLIENT_ERROR).send({
      errMsg: "There was a problem with the itemId, userId, or qty parameters.",
    });
  } else {
    const response = await InventoryModel.updateBagItemOwnership(itemId, userId, qty);
    if (response) {
      res.status(ResponseCodes.OK).send({ bagItemOwnership: response });
    } else {
      res.status(ResponseCodes.API_ERROR).send({
        errorMsg: "There was a problem updating the bag item ownership.",
      });
    }
  }
}

async function equipBagItem(req: Request, res: Response) {
  const { itemId, userId, qty } = req.body;

  if (!assertString(itemId) || !assertString(userId) || !assertNumber(qty)) {
    res.status(ResponseCodes.CLIENT_ERROR).send({
      errMsg: "There was a problem with the itemId, userId, or qty parameters.",
    });
  } else {
    const response = await InventoryModel.equipBagItem(itemId, userId, qty);
    if (response) {
      res.status(ResponseCodes.OK).send({ equippedItems: response });
    } else {
      res.status(ResponseCodes.API_ERROR).send({
        errorMsg: "There was a problem equipping the bag item.",
      });
    }
  }
}

async function unequipBagItem(req: Request, res: Response) {
  const { equippedItemsId, itemId } = req.body;

  if (!assertString(equippedItemsId) || !assertString(itemId)) {
    res.status(ResponseCodes.CLIENT_ERROR).send({
      errMsg: "There was a problem with the equippedItemsId or itemId parameters.",
    });
  } else {
    const response = await InventoryModel.unequipBagItem(equippedItemsId, itemId);
    if (response) {
      res.status(ResponseCodes.OK).send({ bagItemOwnership: response });
    } else {
      res.status(ResponseCodes.API_ERROR).send({
        errorMsg: "There was a problem unequipping the bag item.",
      });
    }
  }
}

async function getAllStoreItems(_req: Request, res: Response) {
  const response = await InventoryModel.getAllStoreItems();
  
  if (response) {
    res.status(ResponseCodes.OK).send({ storeItems: response });
  } else {
    res.status(ResponseCodes.API_ERROR).send({
      errorMsg: "There was a problem getting the store items.",
    });
  }
}

async function getUserEquippedItems(req: Request, res: Response) {
  const { userId } = req.body;

  if (!assertString(userId)) {
    res.status(ResponseCodes.CLIENT_ERROR).send({
      errMsg: "There was a problem with the userId parameter.",
    });
  } else {
    const response = await InventoryModel.getUserEquippedItems(userId);
    if (response) {
      res.status(ResponseCodes.OK).send({ equippedItems: response });
    } else {
      res.status(ResponseCodes.API_ERROR).send({
        errorMsg: "There was a problem getting the user equipped items.",
      });
    }
  }
}

async function getUserInventory(req: Request, res: Response) {
  const { userId } = req.body;

  if (!assertString(userId)) {
    res.status(ResponseCodes.CLIENT_ERROR).send({
      errMsg: "There was a problem with the userId parameter.",
    });
  } else {
    const response = await InventoryModel.getUserInventory(userId);
    if (response) {
      res.status(ResponseCodes.OK).send({ inventory: response });
    } else {
      res.status(ResponseCodes.API_ERROR).send({
        errorMsg: "There was a problem getting the user inventory.",
      });
    }
  }
}

export const InventoryController = {
    addBagItemOwnership,
    updateBagItemOwnership,
    equipBagItem,
    unequipBagItem,
    getAllStoreItems,
    getUserEquippedItems,
    getUserInventory
};
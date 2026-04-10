import { Request, Response } from 'express';
import { ResponseCodes } from "../config/enums/ResponseCodes.js";
import { InventoryModel } from "../models/InventoryModel.js";
import { assertString, assertNumber } from "./asserts/asserts.js";

async function equipBagItem(req: Request, res: Response) {
  const { itemId, userId, qty } = req.body;

  if (!assertString(itemId) || !assertString(userId)) {
    res.status(ResponseCodes.CLIENT_ERROR).send({
      errMsg: "There was a problem with the itemId, userId, or qty parameters.",
    });
  } else {
    const response = await InventoryModel.equipBagItem(itemId, userId);
    if (response) {
      res.status(ResponseCodes.OK).send({ data: response });
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
      res.status(ResponseCodes.OK).send({ data: response });
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
    res.status(ResponseCodes.OK).send({ data: response });
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
      res.status(ResponseCodes.OK).send({ data: response });
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
      res.status(ResponseCodes.OK).send({ data: response });
    } else {
      res.status(ResponseCodes.API_ERROR).send({
        errorMsg: "There was a problem getting the user inventory.",
      });
    }
  }
}

async function buyItem(req: Request, res: Response) {
  const { itemId, userId, qty } = req.body;

  if (!assertString(itemId) || !assertString(userId) || !assertNumber(qty)) {
    res.status(ResponseCodes.CLIENT_ERROR).send({
      errMsg: "There was a problem with the itemId, userId, or qty parameters.",
    });
  } else {
    const response = await InventoryModel.buyItem(itemId, userId, qty);
    if (response) {
      res.status(ResponseCodes.OK).send({ data: response });
    } else if (response === false) {
      res.status(ResponseCodes.CLIENT_ERROR).send({
        errorMsg: "The user cannot afford this transaction.",
      });
    } else {
      res.status(ResponseCodes.API_ERROR).send({
        errorMsg: "There was a problem buying the item.",
      });
    }
  }
}

async function useTreat(req: Request, res: Response) {
  const { userId, itemId, qty } = req.body;

  if (!assertString(itemId) || !assertString(userId) || !assertNumber(qty)) {
    res.status(ResponseCodes.CLIENT_ERROR).send({
      errMsg: "There was a problem with the itemId, userId, or qty parameters.",
    });
  } else {
    const response = await InventoryModel.useTreat(itemId, userId, qty);
    if (response) {
      res.status(ResponseCodes.OK).send({ data: response });
    } else {
      res.status(ResponseCodes.API_ERROR).send({
        errorMsg: "There was a problem using the treat.",
      });
    }
  }
}

export const InventoryController = {
    equipBagItem,
    unequipBagItem,
    getAllStoreItems,
    getUserEquippedItems,
    getUserInventory,
    buyItem,
    useTreat
};
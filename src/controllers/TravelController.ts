import { Request, Response } from "express";
import { ResponseCodes } from "../config/enums/ResponseCodes.js";
import { assertString } from "./asserts/asserts.js";
import { TravelModel } from "../models/TravelModel.js";

async function beginTrip(req: Request, res: Response) {
  const { userId, equippedItemsId } = req.body;

  if (!assertString(userId) || !assertString(equippedItemsId)) {
    res.status(ResponseCodes.CLIENT_ERROR).send({
      errMsg:
        "There was a problem with the userId or equippedItemsId parameter.",
    });
  }

  const response = await TravelModel.beginTrip(userId, equippedItemsId);

    if (response) {
      res.status(ResponseCodes.OK).send({data: response});
    } else {
      res.status(ResponseCodes.API_ERROR).send({
        errMsg: "There was a problem beginning the trip.",
      });
    }
}

export const TravelController = {
    beginTrip
};

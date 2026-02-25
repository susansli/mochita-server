import { Request, Response } from "express";
import { ResponseCodes } from "../config/enums/ResponseCodes.js";
import { assertUser } from "./asserts/assertUser.js";
import { UserModel } from "../models/UserModel.js";
import { assertString } from "./asserts/asserts.js";

async function createUser(req: Request, res: Response) {
  const { day, happiness, sprouts } = req.body;
  const errMsg = assertUser(day, happiness, sprouts);
  if (errMsg.length > 0) {
    res.status(ResponseCodes.CLIENT_ERROR).send({
      errMsg: errMsg,
    });
  } else {
    const response = await UserModel.createUser({
      day: day,
      happiness: happiness,
      sprouts: sprouts,
    });

    if (response) {
      res.status(ResponseCodes.OK).send({ user: response });
    } else {
      res.status(ResponseCodes.API_ERROR).send({
        errorMsg: "There was a problem creating the user.",
      });
    }
  }
}

async function updateUser(req: Request, res: Response) {
  const { day, happiness, sprouts } = req.body;
  const errMsg = assertUser(day, happiness, sprouts);
  if (errMsg.length > 0) {
    res.status(ResponseCodes.CLIENT_ERROR).send({
      errMsg: errMsg,
    });
  } else {
    const response = await UserModel.updateUser({
      day: day,
      happiness: happiness,
      sprouts: sprouts,
    });

    if (response) {
      res.status(ResponseCodes.OK).send({ user: response });
    } else {
      res.status(ResponseCodes.API_ERROR).send({
        errorMsg: "There was a problem updating the user.",
      });
    }
  }
}

async function getUser(req: Request, res: Response) {
  const { id } = req.body;

  if (!assertString(id)) {
    res.status(ResponseCodes.CLIENT_ERROR).send({
      errMsg: "There was a problem with the id parameter.",
    });
  } else {
    const response = await UserModel.getUser(id);
    if (response) {
      res.status(ResponseCodes.OK).send({ user: response });
    } else {
      res.status(ResponseCodes.API_ERROR).send({
        errorMsg: "There was a problem getting the user.",
      });
    }
  }
}

async function deleteAllUserData(req: Request, res: Response) {
  const { id } = req.body;

  if (!assertString(id)) {
    res.status(ResponseCodes.CLIENT_ERROR).send({
      errMsg: "There was a problem with the id parameter.",
    });
  } else {
    const response = await UserModel.deleteAllUserData(id);
    if (response) {
      res.status(ResponseCodes.OK).send({ user: response });
    } else {
      res.status(ResponseCodes.API_ERROR).send({
        errorMsg: "There was a problem deleting the user.",
      });
    }
  }
}


export const UserController = {
  createUser,
  updateUser,
  getUser,
  deleteAllUserData
};

import express, { Router } from "express";

import { UserController } from "../controllers/UserController.js";

export const UserRouter: Router = express.Router();

UserRouter.route("/create").post(UserController.createUser);
UserRouter.route("/update").put(UserController.updateUser);
UserRouter.route("/get").post(UserController.getUser);
UserRouter.route("/delete").delete(UserController.deleteAllUserData);
import express, { Router } from "express";
import { InventoryController } from "../controllers/InventoryController.js";

export const InventoryRouter: Router = express.Router();

InventoryRouter.route("/addBagItemOwnership").post(InventoryController.addBagItemOwnership);

InventoryRouter.route("/updateBagItemOwnership").put(InventoryController.updateBagItemOwnership);
InventoryRouter.route("/equipBagItem").post(InventoryController.equipBagItem);
InventoryRouter.route("/unequipBagItem").post(InventoryController.unequipBagItem);

InventoryRouter.route("/getAllStoreItems").get(InventoryController.getAllStoreItems);
InventoryRouter.route("/getUserEquippedItems").post(InventoryController.getUserEquippedItems);
InventoryRouter.route("/getUserInventory").post(InventoryController.getUserInventory);
import mongoose from "mongoose";
import { Identifiable } from "./Identifiable.js";

export interface EquippedItems extends Identifiable {
  userId: mongoose.Types.ObjectId;
  slot1?: mongoose.Types.ObjectId;
  slot2?: mongoose.Types.ObjectId;
  slot3?: mongoose.Types.ObjectId;
  slot4?: mongoose.Types.ObjectId;
}

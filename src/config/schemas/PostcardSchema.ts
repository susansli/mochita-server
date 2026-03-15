import mongoose from "mongoose";
import { Postcard } from "../interfaces/Postcard.js";
import { stripAndFormatIds } from "../../utils/stripAndFormatIds.js";

const schema = new mongoose.Schema<Postcard>({
  userId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  tripDataId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
    postcardText: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
});

schema.plugin(stripAndFormatIds);

export const PostcardSchema = mongoose.model<Postcard>(
  "Postcard",
  schema,
);

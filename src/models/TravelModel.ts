import { gemini } from "../config/ai-models/gemini.js";
import cloudinary from "../config/cloudinary/cloudinary.js";
import { RARE_LOCATION_PROBABILITY } from "../config/constants/contants.js";
import {
  commonLocationInstruction,
  commonLocationData,
  rareLocationInstruction,
  rareLocationData,
} from "../config/data/locationData.js";
import { getRandomElemFromArray } from "../utils/getRandomElemFromArray.js";

export function generateLocationPrompt(isRare: boolean) {
  const travelData = isRare ? rareLocationData : commonLocationData;

  let travelLocation = getRandomElemFromArray(Object.keys(travelData));

  if (travelLocation && travelData[travelLocation]) {
    return `A ${travelLocation.replace(/_/g, " ")} that has ${travelData[travelLocation]["vibes"]} vibes and is described as follows: ${travelData[travelLocation]["location-description"]}.`;
  }

  return ""; // should never happen
}

export async function generateLocationImage(
  isRare: boolean,
  basePrompt: string,
) {
  try {
    const prompt = `Create an illustration in a kawaii, nostalgic, colorful, and hand-drawn style similar to the art style of the game Tabikaeru with these details: ${basePrompt} ${isRare ? rareLocationInstruction : commonLocationInstruction}.`;

    const response = await gemini.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: prompt,
      config: {
        imageConfig: {
          imageSize: "512px",
          aspectRatio: "16:9",
        }
      }
    });

    const base64Data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    const mimeType = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType || 'image/jpeg';

    if (!base64Data) {
      throw new Error("No image data returned from the Gemini API.");
    }

    const dataUri = `data:${mimeType};base64,${base64Data}`;

    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: "mochita",
    });

    return uploadResult.secure_url;

  } catch (e) {
    console.log("error: ", e);
    return null;
  }
}

export async function generateLocationName() {}

export async function generateLocationFlavor() {}

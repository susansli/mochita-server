import { gemini } from "../config/ai-models/gemini.js";
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
    const prompt = `${basePrompt} ${isRare ? rareLocationInstruction : commonLocationInstruction}.`;

    const response = await gemini.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: prompt,
    });

    

  } catch (e) {
    console.log("error: ", e);
    return null;
  }
}

export async function generateLocationName() {}

export async function generateLocationFlavor() {}

import { gemini } from "../config/ai-models/gemini.js";
import cloudinary from "../config/cloudinary/cloudinary.js";

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
    const prompt = `Create an illustration in a kawaii, nostalgic, colorful, and hand-drawn style similar to the art style of the game Tabikaeru with these details: ${basePrompt} ${isRare ? rareLocationInstruction : commonLocationInstruction}. Make no references to Tabikaeru in the image or easter egg.`;

    const response = await gemini.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: prompt,
      config: {
        imageConfig: {
          imageSize: "512px",
          aspectRatio: "16:9",
        },
      },
    });

    const base64Data =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    const mimeType =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType ||
      "image/jpeg";

    if (!base64Data) {
      throw new Error("No image data returned from the Gemini API.");
    }

    const dataUri = `data:${mimeType};base64,${base64Data}`;

    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: "mochita",
    });

    return {
      url: uploadResult.secure_url,
      base64Data: base64Data,
      mimeType: mimeType,
    };
  } catch (e) {
    console.log("error: ", e);
    return null;
  }
}

export async function generateLocationName(prompt: string) {
  try {
    const imageResponse = await fetch(
      "https://res.cloudinary.com/drt4r7tyw/image/upload/v1772931807/mochita/fznglxfyznjhw8rdfxnv.png",
    );

    if (!imageResponse.ok) {
      throw new Error(
        `Failed to fetch image from URL: ${imageResponse.statusText}`,
      );
    }

    const mimeType = imageResponse.headers.get("content-type") || "image/png";
    const arrayBuffer = await imageResponse.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    const textResponse = await gemini.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { data: base64Data, mimeType: mimeType } },
            {
              text: `Generate a whimsical and creative name for this location, based on the image uploaded, with this additional information as reference: ${prompt}. Format should be one adjective and one nown. Only return 1 name (should have 2 words).`,
            },
          ],
        },
      ],
    });

    if (!textResponse) {
      return null;
    }

    return textResponse.text;
  } catch (e) {
    console.log("error: ", e);
    return null;
  }
}

export async function generateLocationFlavor(
  locationName: string,
  prompt: string,
) {
  try {
    const imageResponse = await fetch(
      "https://res.cloudinary.com/drt4r7tyw/image/upload/v1772931807/mochita/fznglxfyznjhw8rdfxnv.png",
    );

    if (!imageResponse.ok) {
      throw new Error(
        `Failed to fetch image from URL: ${imageResponse.statusText}`,
      );
    }

    const mimeType = imageResponse.headers.get("content-type") || "image/png";
    const arrayBuffer = await imageResponse.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    const textResponse = await gemini.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { data: base64Data, mimeType: mimeType } },
            {
              text: `Generate 2 sentences of fun, whimsical and creative flavor text for this location called ${locationName} based on the image uploaded, with this additional information as reference: ${prompt}. Only output the 2 sentence description and nothing else.`,
            },
          ],
        },
      ],
    });

    if (!textResponse) {
      return null;
    }

    return textResponse.text;
  } catch (e) {
    console.log("error: ", e);
    return null;
  }
}

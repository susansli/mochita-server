import mongoose from "mongoose";
import { gemini } from "../config/ai-models/gemini.js";
import cloudinary from "../config/cloudinary/cloudinary.js";

import {
  commonLocationInstruction,
  commonLocationData,
  rareLocationInstruction,
  rareLocationData,
} from "../config/data/locationData.js";
import { EquippedItemsSchema } from "../config/schemas/EquippedItemsSchema.js";
import { getRandomElemFromArray } from "../utils/getRandomElemFromArray.js";
import {
  EASTER_EGG_PROBABILITY,
  POSTCARD_GENERATION_PROBABILITY,
  RARE_LOCATION_PROBABILITY,
  TRIP_DURATION,
  TRIP_END_PROBABILITY,
} from "../config/constants/contants.js";
import { BagItemMetadataSchema } from "../config/schemas/BagItemMetadataSchema.js";
import { TripDataSchema } from "../config/schemas/TripDataSchema.js";
import { PostcardSchema } from "../config/schemas/PostcardSchema.js";
import { TripData } from "../config/interfaces/TripData.js";
import { Postcard } from "../config/interfaces/Postcard.js";
import { mochitaPromptInstructions } from "../config/constants/promptData.js";

function generateLocationPrompt(isRare: boolean) {
  const travelData = isRare ? rareLocationData : commonLocationData;

  let travelLocation = getRandomElemFromArray(Object.keys(travelData));

  if (travelLocation && travelData[travelLocation]) {
    return `A ${travelLocation.replace(/_/g, " ")} that has ${travelData[travelLocation]["vibes"]} vibes and is described as follows: ${travelData[travelLocation]["location-description"]}.`;
  }

  throw new Error("Failed to generate location prompt."); // should never happen
}

async function generateLocationImage(isRare: boolean, basePrompt: string) {
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
      folder: "mochita/trip-img",
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

async function generateLocationName(
  prompt: string,
  base64Data: string,
  mimeType: string,
) {
  try {
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

async function generateLocationFlavor(
  locationName: string,
  prompt: string,
  base64Data: string,
  mimeType: string,
) {
  try {
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

async function beginTrip(userId: string, equippedItemsId: string) {
  try {
    // Find equipped items

    const equippedItemsObjId = new mongoose.Types.ObjectId(equippedItemsId);

    const userEquippedItems =
      await EquippedItemsSchema.findById(equippedItemsObjId);

    if (!userEquippedItems) {
      return null;
    }

    // Calculate rarity prob, easter egg prob, trip end prob

    let rarityProb = RARE_LOCATION_PROBABILITY;
    let easterEggProb = EASTER_EGG_PROBABILITY;
    let tripEndProb = TRIP_END_PROBABILITY;
    let tripDuration = TRIP_DURATION;

    if (
      !userEquippedItems?.slot1 ||
      !userEquippedItems?.slot2 ||
      !userEquippedItems?.slot3 ||
      !userEquippedItems?.slot4
    ) {
      return null;
    }

    const slot1Metadata = await BagItemMetadataSchema.findOne({
      bagItemId: userEquippedItems.slot1,
    });
    const slot2Metadata = await BagItemMetadataSchema.findOne({
      bagItemId: userEquippedItems.slot2,
    });
    const slot3Metadata = await BagItemMetadataSchema.findOne({
      bagItemId: userEquippedItems.slot3,
    });
    const slot4Metadata = await BagItemMetadataSchema.findOne({
      bagItemId: userEquippedItems.slot4,
    });

    if (!slot1Metadata || !slot2Metadata || !slot3Metadata || !slot4Metadata) {
      return null;
    }

    rarityProb +=
      slot1Metadata.tripRareProbMod +
      slot2Metadata.tripRareProbMod +
      slot3Metadata.tripRareProbMod +
      slot4Metadata.tripRareProbMod;

    easterEggProb +=
      slot1Metadata.tripEventEasterEggProbMod +
      slot2Metadata.tripEventEasterEggProbMod +
      slot3Metadata.tripEventEasterEggProbMod +
      slot4Metadata.tripEventEasterEggProbMod;

    tripEndProb +=
      slot1Metadata.tripEndProbMod +
      slot2Metadata.tripEndProbMod +
      slot3Metadata.tripEndProbMod +
      slot4Metadata.tripEndProbMod;

    tripDuration +=
      slot1Metadata.tripDurationMod +
      slot2Metadata.tripDurationMod +
      slot3Metadata.tripDurationMod +
      slot4Metadata.tripDurationMod;

    // Delete equipped items schema (consumed)

    const deleteEquippedItems =
      await EquippedItemsSchema.findByIdAndDelete(equippedItemsObjId);

    if (!deleteEquippedItems) {
      return null; // should throw in a mech to restore the user's equipped items if this happens
    }

    // generate base location prompt

    const isRare = Math.random() <= rarityProb;

    const basePrompt = generateLocationPrompt(isRare);

    const locationImage = await generateLocationImage(isRare, basePrompt);

    if (!locationImage) {
      return null;
    }

    const locationName = await generateLocationName(
      basePrompt,
      locationImage.base64Data,
      locationImage.mimeType,
    );

    if (!locationName) {
      return null;
    }

    const locationFlavor = await generateLocationFlavor(
      locationName,
      basePrompt,
      locationImage.base64Data,
      locationImage.mimeType,
    );

    if (!locationFlavor) {
      return null;
    }
    // create trip data schema with all the generated data and calculated probabilities

    const tripData = {
      userId: new mongoose.Types.ObjectId(userId),
      locationImgUrl: locationImage.url,
      locationName: locationName,
      locationFlavorText: locationFlavor,
      tripDuration: tripDuration,
      tripEndProb: tripEndProb,
      tripEasterEggProb: easterEggProb,
      currentTravelStageText:
        "Mochita has just started her trip! Keep checking for updates on her adventure.",
      startDateString: new Date().toLocaleDateString(),
    };

    const createdTripData = await TripDataSchema.create(tripData);
    if (!createdTripData) {
      return null;
    }

    return createdTripData;
  } catch (e) {
    console.log("error: ", e);
    return null;
  }
}

async function createTripUpdate(userId: string) {
  // this function rolls every 24hrs via cron

  // check if the user has an active trip

  const activeTrip = await TripDataSchema.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    endDateString: { $exists: false },
  });

  // we can skip if their trip isn't active

  if (!activeTrip) {
    return null;
  }

  const daysElapsed = activeTrip.daysElapsed + 1;

  // otherwise check first to see if they have a postcard
  // if not then create one (they're guaranteed to get one postcard)

  const doesFirstPostcardExist = await PostcardSchema.exists({
    userId: new mongoose.Types.ObjectId(userId),
    tripId: activeTrip._id,
  });

  if (!doesFirstPostcardExist) {
    // generate one postcard
    const createdPostcard = await createTripPostcard(
      activeTrip,
      activeTrip._id,
    );


    if (!createdPostcard) {
      return null;
    }

    // standard trip update
    return await continueTrip(activeTrip, daysElapsed, activeTrip._id);

  } else {
    // otherwise, this means this is at least day 2 of their trip

    // check if the trip naturally ends
    if (daysElapsed === activeTrip.tripDuration) {
      // generate natural trip end

      return await endTrip(false, activeTrip, daysElapsed, activeTrip._id);
    }

    // check if the trip ends (unlucky roll)

    if (Math.random() <= activeTrip.tripEndProb) {
      // generate early trip end

      return await endTrip(true, activeTrip, daysElapsed, activeTrip._id);
    } else {
      // roll for additional postcard generation
      if (Math.random() <= POSTCARD_GENERATION_PROBABILITY) {
        const createdPostcard = await createTripPostcard(
          activeTrip,
          activeTrip._id,
        );

        if (!createdPostcard) {
          return null;
        }
      }

      // standard trip update
      return await continueTrip(activeTrip, daysElapsed, activeTrip._id);
    }
  }
}

async function createTripPostcard(
  tripData: TripData,
  tripId: mongoose.Types.ObjectId,
) {
  try {
    // fetch from image url and transform to base64 to feed into gemini for postcard generation
    const mochitaImageRef = await fetch(
      "https://res.cloudinary.com/drt4r7tyw/image/upload/v1773610761/mochi-ref_dedkcu.png",
    );
    if (!mochitaImageRef.ok) {
      return null;
    }

    const mochitaMimeType = mochitaImageRef.headers.get("content-type");
    const mochitaArrayBuffer = await mochitaImageRef.arrayBuffer();
    const mochitaBase64data =
      Buffer.from(mochitaArrayBuffer).toString("base64");

    // fetch location image and transform to base64
    const locationImageRef = await fetch(tripData.locationImgUrl);
    if (!locationImageRef.ok) {
      throw new Error(`HTTP error! status: ${locationImageRef.status}`);
    }
    const locationMimeType = locationImageRef.headers.get("content-type");
    const locationArrayBuffer = await locationImageRef.arrayBuffer();
    const locationBase64data =
      Buffer.from(locationArrayBuffer).toString("base64");

    // pass to gemini api

    const imgPrompt = `Create a postcard in a kawaii, nostalgic, colorful, and hand-drawn style similar to the art style of the game Tabikaeru with these details: ${tripData.locationFlavorText}. The postcard should feature Mochita, the white cartoon cat provided as reference somewhere in the image with appropriate accessories to the location. Do not make the postcard explicitly reference Tabikaeru anywhere. The postcard should look like something that could be sent from this location named ${tripData.locationName} and resemble the location graphic, also provided as reference.`;

    const response = await gemini.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: [
        { text: imgPrompt },
        {
          inlineData: {
            mimeType: mochitaMimeType || "image/png",
            data: mochitaBase64data,
          },
        },
        {
          inlineData: {
            mimeType: locationMimeType || "image/png",
            data: locationBase64data,
          },
        },
      ],
      config: {
        imageConfig: {
          imageSize: "1k",
          aspectRatio: "16:9",
        },
      },
    });

    // upload postcard to cloudinary

    const postcardBase64Data =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    const postcardMimeType =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType ||
      "image/jpeg";

    if (!postcardBase64Data) {
      return null;
    }

    const postcardDataUri = `data:${postcardMimeType};base64,${postcardBase64Data}`;

    const uploadResult = await cloudinary.uploader.upload(postcardDataUri, {
      folder: "mochita/postcard-img",
    });

    if (!uploadResult || !uploadResult.secure_url) {
      return null;
    }

    // generate postcard text with gemini

    const textPrompt = `${mochitaPromptInstructions} Generate 3-4 sentences of fun, whimsical and creative postcard text to go along with this postcard image based on the location flavor text: ${tripData.locationFlavorText} and location name: ${tripData.locationName}. The postcard text should be something that could be written by a traveler visiting this location and should be consistent with the location data provided. Only output the postcard text and nothing else. The postcard image is provided as reference, and the text must be relevant.`;

    const textResponse = await gemini.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: postcardBase64Data,
                mimeType: postcardMimeType,
              },
            },
            {
              text: textPrompt,
            },
          ],
        },
      ],
    });

    if (!textResponse || !textResponse.text) {
      return null;
    }

    // create postcard schema with url and reference to trip

    const postcardData: Postcard = {
      userId: new mongoose.Types.ObjectId(tripData.userId),
      tripDataId: tripId,
      imageUrl: uploadResult.secure_url,
      postcardText: textResponse.text,
    };

    const createdPostcard = await PostcardSchema.create(postcardData);

    if (!createdPostcard) {
      return null;
    }
    return createdPostcard;
  } catch (e) {
    console.log("error: ", e);
    return null;
  }
}

async function endTrip(
  earlyEnd: boolean,
  tripData: TripData,
  daysElapsed: number,
  tripId: mongoose.Types.ObjectId,
) {
  try {
    let textPrompt;

    if (earlyEnd) {
      textPrompt = `${mochitaPromptInstructions} Generate 2 sentences of fun, whimsical and creative text describing the end of a trip that ended early due to unfortunate circumstances. The trip was to a location called ${tripData.locationName} with the following flavor text: ${tripData.locationFlavorText}. The text should be something that could be written by a traveler whose trip ended early and should be consistent with the location name and flavor text. It should flow naturally from the last trip update: ${tripData.currentTravelStageText} Only output the trip end text and nothing else.`;
    } else {
      textPrompt = `${mochitaPromptInstructions} Generate 2 sentences of fun, whimsical and creative text describing the end of a trip that ended after a fulfilling adventure. The trip was to a location called ${tripData.locationName} with the following flavor text: ${tripData.locationFlavorText}. The text should be something that could be written by a traveler whose trip ended naturally and should be consistent with the location name and flavor text. It should flow naturally from the last trip update: ${tripData.currentTravelStageText} Only output the trip end text and nothing else.`;
    }

    const textResponse = await gemini.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: textPrompt,
            },
          ],
        },
      ],
    });

    if (!textResponse || !textResponse.text) {
      return null;
    }

    const updatedTripData = await TripDataSchema.findByIdAndUpdate(
      tripId,
      {
        currentTravelStageText: textResponse.text,
        endDateString: new Date().toLocaleDateString(),
        daysElapsed: daysElapsed,
      },
      { new: true },
    );

    if (!updatedTripData) {
      return null;
    }

    return updatedTripData;
  } catch (e) {
    console.log("error: ", e);
    return null;
  }
}

async function continueTrip(
  tripData: TripData,
  daysElapsed: number,
  tripId: mongoose.Types.ObjectId,
) {
  let textPrompt = `${mochitaPromptInstructions} Generate 2 sentences of fun, whimsical and creative text describing the next stage of a trip. The trip is to a location called ${tripData.locationName} with the following flavor text: ${tripData.locationFlavorText}. The text should be something that could be written by a traveler whose trip is ongoing and should be consistent with the location name and flavor text. It should flow naturally from the last trip update: ${tripData.currentTravelStageText} Only output the next stage trip update text and nothing else.`;

  // roll for easter egg event
  if (Math.random() <= tripData.tripEasterEggProb) {
    textPrompt += ` Also, include in the update an additional sentence of an extraordinary event that happened, like an easter egg event. Make it really unique and rare.`;
  }

  // call gemini api

  const textResponse = await gemini.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: textPrompt,
          },
        ],
      },
    ],
  });

  if (!textResponse || !textResponse.text) {
    return null;
  }

  const updatedTripData = await TripDataSchema.findByIdAndUpdate(
    tripId,
    {
      currentTravelStageText: textResponse.text,
      daysElapsed: daysElapsed,
    },
    { new: true },
  );

  if (!updatedTripData) {
    return null;
  }

  return updatedTripData;
}

export const TravelModel = {
  beginTrip,
  createTripUpdate,
};

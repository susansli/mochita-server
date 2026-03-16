export const MAX_HAPPINESS: number = 5;
export const MAX_GOALS: number = 5;
export const GOAL_SPROUTS: number = 10;
export const JOURNAL_SPROUTS: number = 10;

// LOCATION

export const RARE_LOCATION_PROBABILITY = 0.075;
export const EASTER_EGG_PROBABILITY = 0.05;
export const TRIP_END_PROBABILITY = 0.1;
export const TRIP_DURATION = 3;
export const POSTCARD_GENERATION_PROBABILITY = 0.25; // guaranteed 1 postcard, then roll each day

// CHAT

export const MAX_CHAT_ROUNDS = 50; // 25 from user, 25 from mochita per chat sesh - refreshes in 24 hrs
export const MAX_MEMORIES_STORED = 15;
export const NUM_CONTEXT_JOURNAL_ENTRIES = 10;
export const NUM_CONTEXT_GOALS = 15;

// AI

export const DEFAULT_GEMINI_MODEL = "gemini-3-flash-preview";
export const FAST_GEMINI_MODEL = "gemini-3.1-flash-lite-preview";
export const DEFAULT_GEMINI_IMG_MODEL = "gemini-3.1-flash-image-preview";

// Refs

export const MOCHITA_REF_URL = "https://res.cloudinary.com/drt4r7tyw/image/upload/v1773610761/mochi-ref_dedkcu.png";

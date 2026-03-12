/**
 * Google Gemini AI Integration (Legacy)
 * Redirects to Amazon Nova for the Hackathon
 */

import { generateContent as generateNovaContent, generateAllFormats as generateNovaAllFormats } from "./nova";

/**
 * Generate content for an achievement using Nova (formerly Gemini)
 */
export const generateContent = generateNovaContent;

/**
 * Generate multiple formats at once using Nova (formerly Gemini)
 */
export const generateAllFormats = generateNovaAllFormats;

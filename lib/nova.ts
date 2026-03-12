/**
 * Amazon Nova AI Integration via AWS Bedrock
 * Replaces lib/gemini.ts
 */

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import type { ContentFormat } from "@/types";

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const NOVA_MODEL_ID = "us.amazon.nova-lite-v1:0";

interface GenerateContentParams {
  achievementTitle: string;
  achievementDescription: string | null;
  repoName: string;
  repoStars: number;
  format: ContentFormat;
}

const FORMAT_PROMPTS: Record<ContentFormat, string> = {
  resume_bullet: `Create a concise, impactful resume bullet point for this achievement. 
    Use action verbs, include metrics where possible, and keep it under 2 lines.
    Format: Start with a strong action verb, describe the action, and highlight the impact.`,

  linkedin_post: `Write an engaging LinkedIn post about this achievement.
    Keep it professional but personable, around 150-200 words.
    Include relevant hashtags at the end.
    Make it shareable and inspiring to other developers.`,

  twitter_thread: `Create a Twitter thread (3-5 tweets) about this achievement.
    Each tweet should be under 280 characters.
    Start with a hook, tell the story, and end with a takeaway.
    Use emojis sparingly but effectively.
    Format each tweet on a new line, numbered 1/, 2/, etc.`,
};

/**
 * Core function to call Nova
 */
export async function askNova(prompt: string, systemPrompt?: string): Promise<string> {
  const payload = {
    messages: [
      {
        role: "user",
        content: [{ text: prompt }],
      },
    ],
    inferenceConfig: {
      maxTokens: 2048,
      temperature: 0.7,
    },
  };

  if (systemPrompt) {
    (payload as any).system = [{ text: systemPrompt }];
  }

  const command = new InvokeModelCommand({
    modelId: NOVA_MODEL_ID,
    body: JSON.stringify(payload),
    contentType: "application/json",
    accept: "application/json",
  });

  try {
    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    return result.output.message.content[0].text;
  } catch (error) {
    console.error("❌ Nova API call failed:", error);
    throw error;
  }
}

/**
 * Generate content for an achievement using Nova
 */
export async function generateContent(
  params: GenerateContentParams
): Promise<string> {
  const prompt = `
You are a developer advocate helping developers showcase their open source contributions.

Achievement: ${params.achievementTitle}
${params.achievementDescription ? `Details: ${params.achievementDescription}` : ""}
Repository: ${params.repoName}
${params.repoStars > 0 ? `Repository Stars: ${params.repoStars}` : ""}

${FORMAT_PROMPTS[params.format]}

Generate the content now:`;

  return askNova(prompt);
}

/**
 * Generate multiple formats at once
 */
export async function generateAllFormats(
  params: Omit<GenerateContentParams, "format">
): Promise<Record<ContentFormat, string>> {
  const formats: ContentFormat[] = ["resume_bullet", "linkedin_post", "twitter_thread"];

  const results = await Promise.all(
    formats.map(async (format) => ({
      format,
      content: await generateContent({ ...params, format }),
    }))
  );

  return results.reduce(
    (acc, { format, content }) => ({ ...acc, [format]: content }),
    {} as Record<ContentFormat, string>
  );
}

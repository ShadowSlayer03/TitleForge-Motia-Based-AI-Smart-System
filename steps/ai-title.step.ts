import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { AITitleContext } from "../constants";
import Video from "../types/Video";
import ImprovedTitle from "../types/ImprovedTitle";
import { generatePrompt } from "../util/utils";
import { EventDataSchema, EventData } from "../schema/aiTitleEventDataSchema";

export const config = {
  name: "GenerateTitles",
  type: "event",
  subscribes: ["yt.videos.fetched"],
  emits: ["yt.titles.ready", "yt.titles.error"],
};

export const handler = async (eventData: any, { emit, logger, state }: any) => {
  let jobId: string | undefined;
  let email: string | undefined;
  let channelName: string | undefined;

  try {
    const data: EventData = EventDataSchema.parse(eventData);
    jobId = data.jobId;
    email = data.email;
    channelName = data.channelName;

    const { channelId, videos } = data;

    logger.info("Resolving YT channel..", {
      jobId,
      channelName,
      videoCount: videos.length,
    });

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) throw new Error("GEMINI API key not configured!");

    const ai = new GoogleGenAI({});

    const jobData = await state.get(`job: ${jobId}`);
    await state.set(`job: ${jobId}`, {
      ...jobData,
      status: "generating titles",
    });

    const videoTitles = videos
      .map((v: Video, index: number) => `${index + 1}. "${v.title}"`)
      .join("\n");

    const prompt = generatePrompt(videos, channelName, videoTitles);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      config: {
        systemInstruction: AITitleContext,
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    });

    logger.info("AI response received (JSON string).");

    const AIContent = response.text;
    const parsedResponse = JSON.parse(AIContent || "");

    const improvedTitles: ImprovedTitle[] = parsedResponse.titles.map(
      (title: any, index: number) => ({
        original: title.original,
        improved: title.improved,
        rationale: title.rationale,
        url: videos[index].url,
      })
    );

    logger.info("Titles generated successfully!", {
      jobId,
      count: improvedTitles.length,
    });

    await state.set(`job: ${jobId}`, {
      ...jobData,
      status: "titles ready",
      improvedTitles,
    });

    await emit({
      topic: "yt.titles.ready",
      data: {
        jobId,
        channelName,
        channelId,
        improvedTitles,
        email,
      },
    });

    return;
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      logger.error("Invalid event data received", { errors: error.errors });
      throw new Error("Invalid event data: " + error.errors.map(e => e.message).join(", "));
    }

    logger.error("Error generating video titles.", { error: error.message });

    if (!jobId || !email) {
      logger.error("Cannot send error notification - missing JobId or Email");
    }

    const jobData = await state.get(`job: ${jobId}`);

    await state.set(`job: ${jobId}`, {
      ...jobData,
      status: "failed",
      error: error.message,
    });

    await emit({
      topic: "yt.titles.error",
      data: {
        jobId,
        email,
        channelName,
        error: "Failed to fetch improved video titles. Please try again!",
      },
    });
  }
};

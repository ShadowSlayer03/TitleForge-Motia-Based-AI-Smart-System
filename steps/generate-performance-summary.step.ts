import { GoogleGenAI } from "@google/genai";
import { AIPerformanceSummaryContext } from "../constants";
import { generatePerformanceSummaryEmailText } from "../util/utils";
import { stateStore } from "../store/stateStore";

export const config = {
  name: "GeneratePerformanceSummary",
  type: "cron",
  cron: "0 9 * * *",
  emits: ["yt.performance.ready", "yt.performance.error"],
};

export const handler = async ({ emit, logger, state }: any) => {
  try {
    const channelInfo = stateStore.get("channelInfo");
    const emailTo = stateStore.get("emailTo");

    if (!channelInfo) {
      logger.info("Performance summary generation is disabled!");
      return;
    }

    const { channelId, channelName } = channelInfo;

    logger.info("Extracted channelId and channelName:", channelId, channelName);

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const YT_API_KEY = process.env.YOUTUBE_API_KEY;
    if (!GEMINI_API_KEY || !YT_API_KEY) throw new Error("Missing API keys");

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;

    if (!RESEND_API_KEY) {
      throw new Error("Resend API Key not configured!");
    }

    if (!RESEND_FROM_EMAIL) {
      throw new Error("Resend FROM EMAIL not configured!");
    }

    logger.info("Fetching videos of the channel....");

    const ai = new GoogleGenAI({});

    // 1️⃣ Fetch latest videos
    const searchURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&type=video&maxResults=10&key=${YT_API_KEY}`;
    const searchResponse = await fetch(searchURL);
    const videosData = await searchResponse.json();

    if (!videosData.items?.length) throw new Error("No videos found");

    logger.info("Fetching details of videos in the channel....");

    const videoIds = videosData.items.map((v: any) => v.id.videoId).join(",");
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails,topicDetails,status&id=${videoIds}&key=${YT_API_KEY}`;
    const res = await fetch(url);
    const videosDetails = (await res.json()).items || [];

    if (!videosDetails.length) throw new Error("No video details found");

    const videoStats = videosDetails.map((v: any) => ({
      title: v.snippet.title,
      description: v.snippet.description,
      publishedAt: v.snippet.publishedAt,
      duration: v.contentDetails?.duration,
      views: v.statistics.viewCount,
      likes: v.statistics.likeCount,
      comments: v.statistics.commentCount,
      favorites: v.statistics.favoriteCount,
      privacy: v.status?.privacyStatus,
      topics: v.topicDetails?.topicCategories || [],
    }));

    // 3️⃣ Structured JSON prompt
    const prompt = `
      You are a YouTube analytics expert. 
      Analyze the following video data for channel "${channelName}" to generate a performance summary.
      Include:
        1. Overall performance trend
        2. Best and worst performing videos
        3. Engagement insights (likes, comments, favorites)
        4. Recommendations to improve click-through and retention
        5. Topic or category patterns as a JSON object with this structure:
      {
        "overallTrend": "string",
        "bestVideos": [{"title":"", "views":"", "likes":"", "comments":""}],
        "worstVideos": [{"title":"", "views":"", "likes":"", "comments":""}],
        "engagementInsights": "string",
        "recommendations": ["string"],
        "topicPatterns": ["string"]
      }

      Video Data: ${JSON.stringify(videoStats)}
    `;

    logger.info("API call to Gemini to get performance summary...")

    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { systemInstruction: AIPerformanceSummaryContext, temperature: 0.5 },
    });

    let raw = aiResponse.text as string;

    raw = raw.replace(/^```(?:json)?\s*/, '').replace(/```$/, '');

    let summaryJSON;
    try {
      summaryJSON = JSON.parse(raw);
    } catch (err) {
      throw new Error("Failed to parse AI JSON response");
    }

    logger.info("Sending performance summary email to the client...")

    const emailHTML = generatePerformanceSummaryEmailText(channelId, channelName, summaryJSON);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: [emailTo],
        subject: `Your performance summary for ${channelName}`,
        html: emailHTML
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Resend API error: ${errorData.message}` || "Unknown Email Error"
      );
    }

    const emailResult = await response.json();

    logger.info("Email sent successfully!", { emailId: emailResult.id });

    await emit({
      topic: "yt.performance.ready",
      data: {
        channelId,
        channelName,
        summary: summaryJSON,
        emailHTML
      },
    });

    logger.info("Performance summary generated and email prepared successfully");

  } catch (error: any) {
    logger.error("Error generating performance summary", { error: error.message });
    await emit({
      topic: "yt.performance.error",
      data: { error: error.message },
    });
  }
};

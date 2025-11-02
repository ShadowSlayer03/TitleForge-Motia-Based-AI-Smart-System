import { ApiRouteConfig } from "motia";
import { stateStore } from "../store/stateStore";

export const config: ApiRouteConfig = {
  name: "TogglePerformanceSummary",
  type: "api",
  path: "/api/performance-summary",
  method: "GET",
  emits: ["yt.submit"],
};

export const handler = async (req: any, { emit, logger, state }: any) => {
  try {
    const { channelId, channelName, email, shouldEnableSummary } = req.queryParams;
    logger.info("Received toggle performance request!", { channelId, channelName, enableSummary: shouldEnableSummary });

    // This is for the CRON since it cannot subscribe to events nor has access to eventData
    stateStore.set("channelInfo", { channelId, channelName, shouldEnableSummary });
    stateStore.set("emailTo",email);

    return {
      status: 200,
      body: {
        success: true,
        message: "Channel state set successfully! Performance summary toggled.",
        data: { channelId, shouldEnableSummary },
      },
    };
  } catch (error: any) {
    logger.error("Error in toggle performance summary handler.", { error: error.message });

    return {
      status: 500,
      body: {
        error: "Internal server error",
        message: error.message
      },
    };
  }
};

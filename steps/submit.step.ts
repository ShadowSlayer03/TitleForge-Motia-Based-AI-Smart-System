import { ApiRouteConfig } from "motia";
import submitSchema from "../schema/submitStepValidationSchema";
import { v4 as uuidv4 } from 'uuid';

export const config: ApiRouteConfig = {
  name: "SubmitChannel",
  type: "api",
  path: "/api/submit",
  method: "POST",
  emits: ["yt.submit"],
};

// emit - publish/broadcast an event that other steps can listen to via 'subscribes' and perform some logic
// logger - same as console.log but with additional functionality
// state - data that has to be shared across different steps, each step can be in a different language
// streams - send live updates to connected clients
export const handler = async (req: any, { emit, logger, state }: any) => {
  try {
    logger.info("Received submission request!", { body: req.body });

    const parseResult = submitSchema.safeParse(req.body);

    if (!parseResult.success) {
      return {
        status: 400,
        body: {
          error: "Invalid input.",
          details: parseResult.error.flatten().fieldErrors,
        },
      };
    }

    const { channel, email } = parseResult.data;

    // Example: Emit event if needed
    // await emit("yt.submit", { channel, email });

    const jobId = uuidv4();

    await state.set(`job: ${jobId}`, {
      jobId,
      channel,
      email,
      status: "queued",
      createdAt: new Date().toISOString()
    });

    logger.info("Job created successfully!", { jobId, channel, email });

    await emit({
      topic: "yt.submit",
      data: {
        jobId,
        channel,
        email
      }
    });

    return {
      status: 200,
      body: {
        success: true,
        message: "Submission received. You will get an email soon containing the suggestions.",
        data: { jobId },
      },
    };
  } catch (error: any) {
    logger.error("Error in submission handler.", { error: error.message });

    return {
      status: 500,
      body: {
        error: "Internal server error",
      },
    };
  }
};

import Video from "types/Video";

export function generatePrompt(videos: Video[], channelName: string, videoTitles: string) {

  return `
    You are a YouTube title optimization expert. Below are ${videos.length} video titles from the channel "${channelName}".

    For each title, provide: 
    1. An improved version that is more engaging, SEO-friendly and liely to get more clicks.
    2. A brief rationale (1-2 sentences) explaining why the improved title is better.

    Guidelines:
    - Keep the core topic and authenticity.
    - Use action verbs, numbers and specific value propositions
    - Make it curiosity-inducing without being clickbait
    - Optimise for searchability and clarity

    Video Titles:
    ${videoTitles}

    Respond in JSON format: 
    {
        "titles": [
            {
                "original" : "...",
                "improved" : "...",
                "rationale" : "...",
            }
        ]
    }
    `
}

export const generateEmailText = (channelId: string, channelName: string, email:string, improvedTitles: any[]) => {
  const titlesList = improvedTitles
    .map(
      (t, i) => `
      <li style="margin-bottom:12px;">
        <b>Original:</b> ${t.original}<br />
        <b>Improved:</b> ${t.improved}<br />
        <i>${t.rationale}</i>
      </li>`
    )
    .join("");

  return `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html dir="ltr" lang="en">
    <head>
      <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
      <meta name="x-apple-disable-message-reformatting" />
    </head>
    <body style="background-color:#ffffff;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen-Sans,Ubuntu,Cantarell,'Helvetica Neue',sans-serif;">
      <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;margin:0 auto;padding:20px 0 48px;">
        <tbody>
          <tr>
            <td>
              <h1 style="text-align:center;color:#5F51E8;margin-bottom:8px;">TitleForge</h1>
              <p style="font-size:16px;line-height:26px;margin-top:16px;margin-bottom:16px;text-align:center;">
                Hi Creator 👋,
              </p>
              <p style="font-size:16px;line-height:26px;margin-top:16px;margin-bottom:16px;">
                We've analyzed the YouTube channel <b>${channelName}</b> and generated AI-optimized titles designed to improve your click-through rate.  
              </p>
              <ul style="font-size:15px;line-height:24px;padding-left:20px;">
                ${titlesList}
              </ul>
              <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="text-align:center;margin-top:30px;">
                <tbody>
                  <tr>
                    <td>
                      <a
                        href="https://localhost:3000"
                        style="background-color:#5F51E8;border-radius:4px;color:#ffffff;font-size:16px;text-decoration:none;padding:12px 24px;display:inline-block;"
                        target="_blank">
                        Visit TitleForge
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- New link for enabling performance updates -->
              <p style="font-size:16px;line-height:26px;margin-top:24px;margin-bottom:16px;text-align:center;">
                <a
                  href="http://localhost:3000/api/performance-summary?channelId=${encodeURIComponent(channelId)}&channelName=${encodeURIComponent(channelName)}&email=${email}&shouldEnableSummary=true"
                  style="color:#5F51E8;text-decoration:underline;"
                  target="_blank">
                  Enable performance updates for this channel
                </a>
              </p>

              <p style="font-size:16px;line-height:26px;margin-top:24px;margin-bottom:16px;">
                Best,<br />The <b>TitleForge</b> Team
              </p>
              <hr style="width:100%;border:none;border-top:1px solid #eaeaea;margin:20px 0;" />
              <p style="font-size:12px;line-height:24px;color:#8898aa;margin-top:16px;margin-bottom:16px;text-align:center;">
                © ${new Date().getFullYear()} TitleForge — AI tools for YouTube Creators
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </body>
  </html>`;
};

export const generateEmailErrorText = (channelName: string, error: any) => {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>TitleForge - Error Notification</title>
  </head>
  <body style="background-color:#ffffff;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen-Sans,Ubuntu,Cantarell,'Helvetica Neue',sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;margin:0 auto;padding:24px;">
      <tr>
        <td align="center">
          <h1 style="color:#5F51E8;font-size:28px;margin-bottom:8px;">TitleForge</h1>
          <p style="color:#555;font-size:16px;margin-top:0;">AI Titles That Shine — Even When Things Go Wrong</p>
        </td>
      </tr>
      <tr>
        <td>
          <p style="font-size:16px;line-height:26px;color:#333;">Hi there,</p>
          <p style="font-size:16px;line-height:26px;color:#333;">
            Unfortunately, we ran into an issue while processing improved titles for your channel
            <strong>${channelName}</strong>.
          </p>
          <p style="font-size:16px;line-height:26px;color:#333;">
            Here's what went wrong:
          </p>
          <blockquote style="border-left:3px solid #5F51E8;padding-left:12px;margin:12px 0;color:#555;font-style:italic;">
            ${error || "An unexpected error occurred during title generation."}
          </blockquote>
          <p style="font-size:16px;line-height:26px;color:#333;">
            Our system automatically logs and reviews all such incidents. You can safely retry your request after a few minutes.
          </p>
          <div style="text-align:center;margin-top:28px;">
            <a href="https://titleforge.ai"
              style="display:inline-block;background-color:#5F51E8;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:16px;">
              Retry Now
            </a>
          </div>
          <p style="font-size:16px;line-height:26px;color:#333;margin-top:24px;">
            Thanks for your patience,<br/>
            <strong>The TitleForge Team</strong>
          </p>
          <hr style="margin:24px 0;border:none;border-top:1px solid #eaeaea;" />
          <p style="font-size:12px;line-height:20px;color:#8898aa;text-align:center;">
            © ${new Date().getFullYear()} TitleForge Inc. All rights reserved.<br/>
            470 Noor Ave STE B #1148, South San Francisco, CA 94080
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
}

export const generatePerformanceSummaryEmailText = (
  channelId: string,
  channelName: string,
  summaryJSON: any
) => {
  const {
    overallTrend,
    bestVideos,
    worstVideos,
    engagementInsights,
    recommendations,
    topicPatterns,
  } = summaryJSON;

  const formatVideoList = (videos: any[]) =>
    videos
      .map(
        (v, i) => `
      <li style="margin-bottom:12px;">
        <b>${i + 1}. ${v.title}</b><br/>
        Views: ${v.views} | Likes: ${v.likes} | Comments: ${v.comments}
      </li>`
      )
      .join("");

  const formatRecommendations = recommendations
    ?.map((r: string) => `<li style="margin-bottom:8px;">${r}</li>`)
    .join("") || "";

  const formatTopics = topicPatterns
    ?.map((t: string) => `<li style="margin-bottom:8px;">${t}</li>`)
    .join("") || "";

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Performance Summary</title>
  </head>
  <body style="background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen-Sans,Ubuntu,Cantarell,'Helvetica Neue',sans-serif;margin:0;padding:0;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;padding:20px;">
      <tr>
        <td>
          <h1 style="text-align:center;color:#5F51E8;">TitleForge Performance Summary</h1>
          <p style="font-size:16px;line-height:24px;">Hi Creator 👋,</p>
          <p style="font-size:16px;line-height:24px;">
            We've analyzed the YouTube channel <b>${channelName}</b> and generated a detailed performance summary for your recent videos.
          </p>

          <h2 style="color:#5F51E8;">Overall Trend</h2>
          <p>${overallTrend}</p>

          <h2 style="color:#5F51E8;">Top Performing Videos</h2>
          <ul style="padding-left:20px;">${formatVideoList(bestVideos)}</ul>

          <h2 style="color:#5F51E8;">Least Performing Videos</h2>
          <ul style="padding-left:20px;">${formatVideoList(worstVideos)}</ul>

          <h2 style="color:#5F51E8;">Engagement Insights</h2>
          <p>${engagementInsights}</p>

          <h2 style="color:#5F51E8;">Recommendations</h2>
          <ul style="padding-left:20px;">${formatRecommendations}</ul>

          <h2 style="color:#5F51E8;">Topic / Category Patterns</h2>
          <ul style="padding-left:20px;">${formatTopics}</ul>

          <p style="font-size:16px;line-height:24px;">
            Best,<br/>
            The <b>TitleForge</b> Team
          </p>

          <hr style="border:none;border-top:1px solid #eaeaea;margin:20px 0;" />
          <p style="font-size:12px;color:#8898aa;text-align:center;">
            © ${new Date().getFullYear()} TitleForge — AI tools for YouTube Creators
          </p>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

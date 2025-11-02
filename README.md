# YT Title & Performance AI Tool

An AI-powered smart tool built with **Motia**, **Zod**, and **Resend API** that helps YouTubers optimize their content. It can:  

- Suggest better titles for your YouTube videos.  
- Generate channel performance insights and send them via email.  

---

## 🚀 Features

1. **Smart Title Suggestions**
   - Submit a YouTube channel handle and receive AI-generated improved video titles.
   - Use the `/api/submit` endpoint for submissions.

2. **Performance Summary**
   - Generates a structured performance summary of your channel using AI.
   - Insights include overall trends, best/worst performing videos, engagement insights, recommendations, and topic patterns.
   - Summaries are emailed directly to the provided address.

3. **Cron-Based Automation**
   - The AI periodically generates performance summaries automatically (configurable via cron syntax).

---

## 🛠 Technologies

- **Motia** – Serverless framework for building API & cron steps.  
- **Google Gemini AI** – For AI content generation and performance analysis.  
- **Zod** – For validating API request bodies.  
- **Resend API** – For sending emails containing AI-generated summaries or title suggestions.  
- **Better-SQLite3** – Lightweight database for storing channel state in memory/local file.  
- **Node.js** – Server runtime.  

---

## ⚡ API Endpoints

### 1️⃣ Submit a YouTube Channel for Title Suggestions

**Endpoint:**  

```

POST /api/submit
Content-Type: application/json

````

**Request Body:**

```json
{
  "channel": "@chaicode",
  "email": "sslayer441@gmail.com"
}
````

**Success Response:**

```json
{
  "success": true,
  "message": "Submission received. You will get an email soon containing the suggestions.",
  "data": {
    "jobId": "1ae5d75f-4c6e-4fc6-a4a4-d13a71d283dd"
  }
}
```

> The `jobId` is internal and can be used to track the submission.

---

### 2️⃣ Toggle Performance Summary for a Channel

**Endpoint:**

```
GET /api/performance-summary
```

**Query Parameters:**

| Parameter             | Description                                  |
| --------------------- | -------------------------------------------- |
| `channelId`           | YouTube Channel ID                           |
| `channelName`         | Channel display name                         |
| `shouldEnableSummary` | `true` to enable, `false` to disable summary |

**Success Response:**

```json
{
  "success": true,
  "message": "Channel state set successfully! Performance summary toggled.",
  "data": {
    "channelId": "UCxKZVGttk_0EMV74M0TEu9w",
    "shouldEnableSummary": true
  }
}
```

---

### 3️⃣ Performance Summary Cron

* Runs automatically based on cron syntax (default: every 1 minute).
* Generates AI-powered summaries of recent videos.
* Emails insights via Resend API.

**Sample Cron Config:**

```ts
export const config = {
  name: "GeneratePerformanceSummary",
  type: "cron",
  cron: "0 9 * * *", // Every day at 9 AM
  emits: ["yt.performance.ready", "yt.performance.error"],
};
```

---

## 💡 Usage

1. **Start Server**

```bash
npm install
npm run dev
```

2. **Submit a Channel for Titles**

Send a POST request to `/api/submit` with your channel handle and email.

3. **Enable Performance Summary**

Call `/api/performance-summary?channelId=<CHANNEL_ID>&channelName=<NAME>&shouldEnableSummary=true`

4. **Receive AI-Powered Insights**

You’ll get an email with structured insights about your channel’s performance.

---

## 📝 Notes

* Make sure **GEMINI_API_KEY**, **YOUTUBE_API_KEY**, and **RESEND_API_KEY** are set in your environment.
* Uses **better-sqlite3** for local persistent state storage.
* Cron steps will only run if `shouldEnableSummary` is set to `true` for the channel.

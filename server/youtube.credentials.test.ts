import { describe, expect, it } from "vitest";
import { ENV } from "./_core/env";

describe("YouTube API credential", () => {
  it("accepts the configured key for a lightweight public video lookup", async () => {
    if (!ENV.youtubeApiKey) {
      throw new Error("YOUTUBE_API_KEY is not available in the test environment.");
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=id&id=dQw4w9WgXcQ&key=${encodeURIComponent(ENV.youtubeApiKey)}`,
      { headers: { Accept: "application/json" } },
    );
    const payload = await response.json() as { items?: Array<{ id?: string }>; error?: { message?: string } };

    expect(response.ok, payload.error?.message ?? "YouTube API credential was rejected").toBe(true);
    expect(payload.items?.[0]?.id).toBe("dQw4w9WgXcQ");
  }, 15000);
});

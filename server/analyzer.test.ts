import { describe, expect, it } from "vitest";
import { analyzeRawComments, createDemoAnalysis, extractYouTubeVideoId } from "./analyzer";

describe("YouTube URL parsing", () => {
  it("extracts IDs from common YouTube URL formats", () => {
    expect(extractYouTubeVideoId("https://www.youtube.com/watch?v=abc123xyz01")).toBe("abc123xyz01");
    expect(extractYouTubeVideoId("https://youtu.be/abc123xyz01?t=42")).toBe("abc123xyz01");
    expect(extractYouTubeVideoId("https://www.youtube.com/shorts/abc123xyz01")).toBe("abc123xyz01");
    expect(extractYouTubeVideoId("not-a-youtube-url")).toBeNull();
  });
});

describe("Marathi analysis engine", () => {
  it("classifies positive, negative, and neutral Marathi comments", () => {
    const result = analyzeRawComments([
      { id: "1", text: "हा व्हिडिओ खूप सुंदर आणि माहितीपूर्ण आहे" },
      { id: "1b", text: "मस्त काम केले आहे, खूप आवडले" },
      { id: "2", text: "ही खूप वाईट आणि फालतू माहिती आहे" },
      { id: "3", text: "व्हिडिओ ठीक आहे" },
    ], { id: "test", url: "https://youtu.be/test", title: "Test", channelTitle: "Test" }, "demo");

    expect(result.analyzedCount).toBe(4);
    expect(result.dominantSentiment).toBe("positive");
    expect(result.comments.map((comment) => comment.sentiment)).toEqual(["positive", "positive", "negative", "neutral"]);
    expect(result.comments[0]?.emotion).toBe("happy");
    expect(result.modelComparison.vocabularySize).toBeGreaterThan(0);
    expect(result.modelComparison.trainingComments).toBeGreaterThan(0);
  });

  it("recognizes common Roman-script Marathi phrases as mixed Marathi", () => {
    const result = analyzeRawComments([
      { id: "roman", text: "khup chan video ahe, mala avdla" },
      { id: "english", text: "This is a useful video" },
    ], { id: "test", url: "https://youtu.be/test", title: "Test", channelTitle: "Test" }, "demo");

    expect(result.comments[0]?.language).toBe("mixed");
    expect(result.languageMode).toBe("marathi");
  });

  it("returns a complete demo result without external services", () => {
    const result = createDemoAnalysis("https://www.youtube.com/watch?v=demo12345");
    expect(result.source).toBe("demo");
    expect(result.totalFetched).toBeGreaterThan(0);
    expect(result.sentimentDistribution).toHaveLength(3);
    expect(result.emotionDistribution).toHaveLength(6);
    expect(result.topWords.length).toBeGreaterThan(0);
    expect(result.video.id).toBe("demo12345");
  });
});

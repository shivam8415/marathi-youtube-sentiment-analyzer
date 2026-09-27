import { ENV } from "./_core/env";

export type Sentiment = "positive" | "negative" | "neutral";
export type Emotion = "happy" | "sad" | "angry" | "fear" | "surprise" | "neutral";

export type AnalyzedComment = {
  id: string;
  text: string;
  sentiment: Sentiment;
  emotion: Emotion;
  sentimentScore: number;
  confidence: number;
  likeCount: number;
  publishedAt?: string;
  authorDisplayName?: string;
  language: "marathi" | "mixed" | "other";
};

export type WordCount = { word: string; count: number };

export type ModelComparison = {
  tfidfNaiveBayesAccuracy: number;
  ruleBasedCoverage: number;
  vocabularySize: number;
  trainingComments: number;
  testingComments: number;
  note: string;
};

export type AnalysisResult = {
  source: "youtube" | "demo";
  video: {
    id: string;
    url: string;
    title: string;
    channelTitle: string;
    thumbnail?: string;
    publishedAt?: string;
    viewCount?: number;
    commentCount?: number;
  };
  totalFetched: number;
  analyzedCount: number;
  skippedCount: number;
  languageMode: "marathi" | "all";
  comments: AnalyzedComment[];
  sentimentDistribution: { label: string; value: number; color: string }[];
  emotionDistribution: { label: string; value: number; color: string }[];
  topWords: WordCount[];
  dominantSentiment: Sentiment;
  dominantEmotion: Emotion;
  averageSentimentScore: number;
  modelComparison: ModelComparison;
  generatedAt: string;
};

type RawComment = {
  id: string;
  text: string;
  likeCount?: number;
  publishedAt?: string;
  authorDisplayName?: string;
};

type YouTubeVideoResponse = {
  items?: Array<{
    snippet?: {
      title?: string;
      channelTitle?: string;
      publishedAt?: string;
      thumbnails?: { high?: { url?: string }; medium?: { url?: string } };
    };
    statistics?: { viewCount?: string; commentCount?: string };
  }>;
};

type YouTubeCommentResponse = {
  nextPageToken?: string;
  items?: Array<{
    id?: string;
    snippet?: {
      totalReplyCount?: number;
      topLevelComment?: {
        id?: string;
        snippet?: {
          textOriginal?: string;
          textDisplay?: string;
          likeCount?: number;
          publishedAt?: string;
          authorDisplayName?: string;
        };
      };
    };
    replies?: {
      comments?: Array<{
        id?: string;
        snippet?: {
          textOriginal?: string;
          textDisplay?: string;
          likeCount?: number;
          publishedAt?: string;
          authorDisplayName?: string;
        };
      }>;
    };
  }>;
};

type YouTubeReplyResponse = {
  nextPageToken?: string;
  items?: Array<{
    id?: string;
    snippet?: {
      textOriginal?: string;
      textDisplay?: string;
      likeCount?: number;
      publishedAt?: string;
      authorDisplayName?: string;
    };
  }>;
};

export class YouTubeAnalysisError extends Error {
  constructor(public readonly kind: "invalid_url" | "missing_key" | "not_found" | "comments_disabled" | "quota" | "api", message: string) {
    super(message);
    this.name = "YouTubeAnalysisError";
  }
}

const MARATHI_STOP_WORDS = new Set([
  "आहे", "आणि", "हे", "हा", "ही", "ते", "तो", "ती", "मी", "तू", "आपण", "तुम्ही", "मला", "माझे", "माझा", "चे", "चा", "ची", "ने", "ला", "ना", "वर", "मध्ये", "पासून", "पण", "तर", "की", "एक", "असे", "अशी", "असा", "खूप", "या", "याचा", "यात", "साठी", "होते", "होता", "होती", "करून", "केले", "केला", "केली", "नाही", "नको", "काय", "कसे", "कधी", "जे", "ज्यांना", "ज्याचा", "अधिक", "फक्त", "देखील", "म्हणून", "म्हणजे", "आता", "आपल्या", "त्याचा", "त्यात", "त्यांना", "सर्व", "वरील", "खाली", "पुन्हा", "मात्र", "नंतर", "आधी", "अगदी", "तरी", "तरिही", "सुद्धा", "पाहिजे", "शकतो", "शकते", "असते", "असतो", "असतील", "होईल", "आहेत",
  "the", "and", "is", "this", "that", "very", "for", "with", "was", "are", "you", "not", "but", "video", "please", "really",
]);

const POSITIVE_TERMS: Record<string, number> = {
  "छान": 2, "सुंदर": 2, "मस्त": 2, "चांगल": 2, "उत्तम": 3, "उत्कृष्ट": 3, "आवड": 2, "अफलातून": 3, "भारी": 2, "कमाल": 3, "लाजवाब": 3, "प्रेरणादायी": 3, "आनंद": 2, "आनंदी": 2, "धन्यवाद": 1, "अभिनंदन": 2, "यश": 2, "सत्य": 1, "उपयुक्त": 2, "माहितीपूर्ण": 2, "सोपे": 1, "सोपं": 1, "मदत": 1, "जिंक": 2, "बेस्ट": 2, "awesome": 3, "great": 2, "good": 2, "nice": 2, "love": 3, "best": 3, "helpful": 2, "amazing": 3, "super": 2, "खरंच": 1, "आभार": 2,
};

const NEGATIVE_TERMS: Record<string, number> = {
  "वाईट": 2, "निराश": 2, "फालतू": 3, "चुकी": 2, "चूक": 2, "घाण": 3, "बकवास": 3, "राग": 2, "दुःख": 2, "दु:ख": 2, "खोट": 2, "त्रास": 2, "बेकार": 3, "कंटाळवाण": 2, "कंटाळा": 2, "खराब": 3, "नापसंत": 2, "आवडत": 2, "द्वेष": 3, "भीती": 1, "समस्या": 1, "नुकसान": 2, "फसवणूक": 3, "अर्थहीन": 2, "किळस": 3, "कमकुवत": 2, "worst": 3, "bad": 2, "hate": 3, "boring": 2, "wrong": 2, "fake": 3, "dislike": 2, "poor": 2, "waste": 3, "angry": 2,
};

const EMOTION_TERMS: Record<Emotion, string[]> = {
  happy: ["आनंद", "आनंदी", "हसू", "हसणे", "मस्त", "छान", "सुंदर", "आवड", "प्रेम", "उत्साह", "यश", "happy", "love", "smile", "awesome", "मजा"],
  sad: ["दुःख", "दु:ख", "दुःखी", "रड", "आसू", "वियोग", "एकट", "निराश", "वाईट", "sad", "cry", "depressed", "दया"],
  angry: ["राग", "संताप", "चीड", "भांडण", "फसवणूक", "अपमान", "चिड", "angry", "hate", "furious", "किळस"],
  fear: ["भीती", "घाबर", "धोका", "भय", "भयानक", "काळजी", "असुरक्षित", "fear", "scared", "danger", "धडकी"],
  surprise: ["आश्चर्य", "अविश्वसनीय", "खरंच", "अचानक", "वा!", "अरे", "surprise", "wow", "incredible", "शॉक"],
  neutral: [],
};

const NEGATIONS = new Set(["नाही", "नको", "नसत", "नसतो", "नसते", "नाहीये", "not", "never", "no", "without"]);

const DEMO_COMMENTS: RawComment[] = [
  { id: "demo-1", text: "हा व्हिडिओ खूप छान आणि माहितीपूर्ण आहे. धन्यवाद!", likeCount: 28, authorDisplayName: "प्रेक्षक १" },
  { id: "demo-2", text: "मला हा भाग खूप आवडला, खूप सुंदर मांडणी केली आहे.", likeCount: 19, authorDisplayName: "प्रेक्षक २" },
  { id: "demo-3", text: "अप्रतिम व्हिडिओ! तुमची माहिती खूप उपयुक्त आहे.", likeCount: 15, authorDisplayName: "प्रेक्षक ३" },
  { id: "demo-4", text: "आवाजाची गुणवत्ता चांगली नाही आणि व्हिडिओ थोडा कंटाळवाणा आहे.", likeCount: 8, authorDisplayName: "प्रेक्षक ४" },
  { id: "demo-5", text: "माहिती ठीक आहे, पण अजून उदाहरणे हवी होती.", likeCount: 5, authorDisplayName: "प्रेक्षक ५" },
  { id: "demo-6", text: "हा विषय खूप दुःखद आहे. मन हेलावून गेले.", likeCount: 12, authorDisplayName: "प्रेक्षक ६" },
  { id: "demo-7", text: "अरे वा! हा निकाल खरोखरच आश्चर्यकारक आहे.", likeCount: 11, authorDisplayName: "प्रेक्षक ७" },
  { id: "demo-8", text: "तुमची चुकीची माहिती देऊन लोकांची दिशाभूल करू नका.", likeCount: 3, authorDisplayName: "प्रेक्षक ८" },
  { id: "demo-9", text: "मस्त काम केले आहे, असेच चांगले व्हिडिओ बनवा.", likeCount: 9, authorDisplayName: "प्रेक्षक ९" },
  { id: "demo-10", text: "हा व्हिडिओ पाहून मला खूप आनंद झाला.", likeCount: 7, authorDisplayName: "प्रेक्षक १०" },
  { id: "demo-11", text: "खूप भीतीदायक प्रसंग होता, अंगावर काटा आला.", likeCount: 4, authorDisplayName: "प्रेक्षक ११" },
  { id: "demo-12", text: "व्हिडिओ ठीक आहे.", likeCount: 2, authorDisplayName: "प्रेक्षक १२" },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function extractYouTubeVideoId(input: string) {
  const value = input.trim();
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return url.pathname.split("/").filter(Boolean)[0] ?? null;
    if (host === "youtube.com" || host.endsWith("youtube.com")) {
      const queryId = url.searchParams.get("v");
      if (queryId) return queryId;
      const segments = url.pathname.split("/").filter(Boolean);
      if (["shorts", "embed", "live"].includes(segments[0] ?? "")) return segments[1] ?? null;
    }
  } catch {
    return null;
  }
  return null;
}

function cleanText(text: string) {
  return decodeHtmlEntities(text)
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/www\.\S+/gi, " ")
    .replace(/[@#][A-Za-z\u0900-\u097F0-9_-]+/g, " ")
    .replace(/[\u0000-\u001f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string) {
  return cleanText(text).toLocaleLowerCase("mr-IN").match(/[A-Za-z\u0900-\u097F0-9]+/g) ?? [];
}

function isMarathi(text: string): "marathi" | "mixed" | "other" {
  const normalized = text.toLocaleLowerCase("mr-IN");
  const devanagariChars = (normalized.match(/[\u0900-\u097f]/g) ?? []).length;
  const latinChars = (normalized.match(/[a-z]/g) ?? []).length;
  const marathiMarkers = ["आहे", "मला", "खूप", "तुम्ही", "माहिती", "व्हिडिओ", "छान", "नाही", "आवड", "साठी", "खरंच", "khup", "chan", "chhan", "mast", "awad", "avad", "mahit", "mahiti", "sundar", "nahi", "ahe", "tumhi", "mala", "marathi", "kay", "kasa", "kashi", "video khup", "changla", "changli", "avdla", "dhanyavad"];
  const markerHit = marathiMarkers.some((term) => normalized.includes(term));
  if (devanagariChars >= 3 && (devanagariChars >= latinChars * 0.25 || markerHit)) return latinChars > devanagariChars ? "mixed" : "marathi";
  if (markerHit) return "mixed";
  return "other";
}

function hasNegation(tokens: string[], index: number) {
  return [
    ...tokens.slice(Math.max(0, index - 3), index),
    ...tokens.slice(index + 1, index + 3),
  ].some((token) => NEGATIONS.has(token));
}

function scoreTerms(tokens: string[], text: string, terms: Record<string, number>) {
  let score = 0;
  for (const [term, weight] of Object.entries(terms)) {
    if (term.includes(" ")) {
      if (text.includes(term)) score += weight;
      continue;
    }
    tokens.forEach((token, index) => {
      if (token === term || (term.length > 3 && token.startsWith(term))) {
        score += hasNegation(tokens, index) ? -weight : weight;
      }
    });
  }
  return score;
}

function classifySentiment(text: string): { sentiment: Sentiment; score: number; confidence: number } {
  const normalized = cleanText(text).toLocaleLowerCase("mr-IN");
  const tokens = tokenize(normalized);
  const positive = scoreTerms(tokens, normalized, POSITIVE_TERMS);
  const negative = scoreTerms(tokens, normalized, NEGATIVE_TERMS);
  const rawScore = positive - negative;
  const score = clamp(rawScore, -10, 10);
  const sentiment: Sentiment = score >= 1 ? "positive" : score <= -1 ? "negative" : "neutral";
  const confidence = sentiment === "neutral" ? 0.54 : clamp(0.56 + Math.abs(score) * 0.055, 0.56, 0.96);
  return { sentiment, score, confidence };
}

function classifyEmotion(text: string, sentiment: Sentiment): Emotion {
  const normalized = cleanText(text).toLocaleLowerCase("mr-IN");
  const scores = (Object.entries(EMOTION_TERMS) as [Emotion, string[]][]).map(([emotion, terms]) => {
    const score = terms.reduce((total, term) => total + (normalized.includes(term.toLocaleLowerCase("mr-IN")) ? 1 : 0), 0);
    return { emotion, score };
  });
  const best = scores.sort((a, b) => b.score - a.score)[0];
  if (!best || best.score === 0) return sentiment === "positive" ? "happy" : sentiment === "negative" ? "sad" : "neutral";
  return best.emotion;
}

function buildModelComparison(comments: AnalyzedComment[]): ModelComparison {
  const documents = comments.map((comment) => ({ tokens: tokenize(comment.text), label: comment.sentiment }));
  const vocabulary = Array.from(new Set(documents.flatMap((document) => document.tokens.filter((token) => token.length > 1 && !MARATHI_STOP_WORDS.has(token)))));
  const split = Math.max(1, Math.floor(documents.length * 0.8));
  const training = documents.slice(0, split);
  const testing = documents.slice(split);
  if (vocabulary.length === 0 || testing.length === 0 || training.length < 2) {
    return { tfidfNaiveBayesAccuracy: 0, ruleBasedCoverage: 0, vocabularySize: vocabulary.length, trainingComments: training.length, testingComments: testing.length, note: "Add more labeled comments for a meaningful holdout comparison." };
  }
  const documentFrequency = new Map<string, number>();
  documents.forEach((document) => Array.from(new Set(document.tokens)).forEach((token) => documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1)));
  const idf = (token: string) => Math.log((documents.length + 1) / ((documentFrequency.get(token) ?? 0) + 1)) + 1;
  const vector = (tokens: string[]) => {
    const counts = new Map<string, number>();
    tokens.forEach((token) => counts.set(token, (counts.get(token) ?? 0) + 1));
    return vocabulary.map((token) => (counts.get(token) ?? 0) * idf(token));
  };
  const classCounts = new Map<Sentiment, number>();
  const tokenSums = new Map<Sentiment, number[]>();
  const tokenTotals = new Map<Sentiment, number>();
  training.forEach((document) => {
    classCounts.set(document.label, (classCounts.get(document.label) ?? 0) + 1);
    const values = vector(document.tokens);
    const sums = tokenSums.get(document.label) ?? vocabulary.map(() => 0);
    values.forEach((value, index) => { sums[index] += value; });
    tokenSums.set(document.label, sums);
    tokenTotals.set(document.label, (tokenTotals.get(document.label) ?? 0) + values.reduce((sum, value) => sum + value, 0));
  });
  const classes: Sentiment[] = ["positive", "negative", "neutral"];
  const predict = (tokens: string[]): Sentiment => {
    const values = vector(tokens);
    return classes.reduce((best, label) => {
      const prior = Math.log(((classCounts.get(label) ?? 0) + 1) / (training.length + classes.length));
      const sums = tokenSums.get(label) ?? vocabulary.map(() => 0);
      const total = tokenTotals.get(label) ?? 0;
      const score = values.reduce((sum, value, index) => sum + value * Math.log((sums[index] + 1) / (total + vocabulary.length)), prior);
      return score > best.score ? { label, score } : best;
    }, { label: "neutral" as Sentiment, score: Number.NEGATIVE_INFINITY }).label;
  };
  const correct = testing.filter((document) => predict(document.tokens) === document.label).length;
  const coverage = Math.round((comments.filter((comment) => comment.language !== "other").length / Math.max(1, comments.length)) * 100);
  return { tfidfNaiveBayesAccuracy: Math.round((correct / testing.length) * 100), ruleBasedCoverage: coverage, vocabularySize: vocabulary.length, trainingComments: training.length, testingComments: testing.length, note: "Holdout score uses current comments with transparent lexicon labels; use manually annotated data for final academic accuracy." };
}

function classifyComment(comment: RawComment): AnalyzedComment {
  const text = cleanText(comment.text);
  const language = isMarathi(text);
  const result = classifySentiment(text);
  return {
    id: comment.id,
    text,
    sentiment: result.sentiment,
    emotion: classifyEmotion(text, result.sentiment),
    sentimentScore: result.score,
    confidence: result.confidence,
    likeCount: comment.likeCount ?? 0,
    publishedAt: comment.publishedAt,
    authorDisplayName: comment.authorDisplayName,
    language,
  };
}

export function analyzeRawComments(rawComments: RawComment[], metadata: AnalysisResult["video"], source: "youtube" | "demo"): AnalysisResult {
  const classified = rawComments.map(classifyComment);
  const marathiComments = classified.filter((comment) => comment.language !== "other");
  const comments = marathiComments.length > 0 ? marathiComments : classified;
  const languageMode: "marathi" | "all" = marathiComments.length > 0 ? "marathi" : "all";
  const sentimentValues: Sentiment[] = ["positive", "negative", "neutral"];
  const sentimentLabels: Record<Sentiment, string> = { positive: "Positive", negative: "Negative", neutral: "Neutral" };
  const sentimentColors: Record<Sentiment, string> = { positive: "#2ab673", negative: "#ee6c4d", neutral: "#9aa7b7" };
  const emotionValues: Emotion[] = ["happy", "sad", "angry", "fear", "surprise", "neutral"];
  const emotionLabels: Record<Emotion, string> = { happy: "Happy", sad: "Sad", angry: "Angry", fear: "Fear", surprise: "Surprise", neutral: "Neutral" };
  const emotionColors: Record<Emotion, string> = { happy: "#f2b84b", sad: "#5e8ee4", angry: "#ee6c4d", fear: "#9b7ede", surprise: "#ef8ac5", neutral: "#9aa7b7" };
  const sentimentDistribution = sentimentValues.map((value) => ({ label: sentimentLabels[value], value: comments.filter((comment) => comment.sentiment === value).length, color: sentimentColors[value] }));
  const emotionDistribution = emotionValues.map((value) => ({ label: emotionLabels[value], value: comments.filter((comment) => comment.emotion === value).length, color: emotionColors[value] }));
  const sentimentCount = Object.fromEntries(sentimentValues.map((value) => [value, comments.filter((comment) => comment.sentiment === value).length])) as Record<Sentiment, number>;
  const emotionCount = Object.fromEntries(emotionValues.map((value) => [value, comments.filter((comment) => comment.emotion === value).length])) as Record<Emotion, number>;
  const dominantSentiment = sentimentValues.reduce((best, value) => sentimentCount[value] > sentimentCount[best] ? value : best, "neutral" as Sentiment);
  const dominantEmotion = emotionValues.reduce((best, value) => emotionCount[value] > emotionCount[best] ? value : best, "neutral" as Emotion);
  const wordCounts = new Map<string, number>();
  comments.forEach((comment) => tokenize(comment.text).forEach((word) => {
    if (word.length > 1 && !MARATHI_STOP_WORDS.has(word)) wordCounts.set(word, (wordCounts.get(word) ?? 0) + 1);
  }));
  const topWords = Array.from(wordCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([word, count]) => ({ word, count }));
  const averageSentimentScore = comments.length ? Number((comments.reduce((total, comment) => total + comment.sentimentScore, 0) / comments.length).toFixed(2)) : 0;
  const modelComparison = buildModelComparison(comments);
  return {
    source,
    video: metadata,
    totalFetched: rawComments.length,
    analyzedCount: comments.length,
    skippedCount: Math.max(0, rawComments.length - comments.length),
    languageMode,
    comments,
    sentimentDistribution,
    emotionDistribution,
    topWords,
    dominantSentiment,
    dominantEmotion,
    averageSentimentScore,
    modelComparison,
    generatedAt: new Date().toISOString(),
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  const body = await response.json().catch(() => null) as { error?: { errors?: Array<{ reason?: string }>; message?: string } } | null;
  if (!response.ok) {
    const reason = body?.error?.errors?.[0]?.reason;
    if (reason === "commentsDisabled") throw new YouTubeAnalysisError("comments_disabled", "Comments are disabled for this video.");
    if (reason === "quotaExceeded" || reason === "dailyLimitExceeded") throw new YouTubeAnalysisError("quota", "YouTube API quota has been exceeded. Try again later or use another API project.");
    throw new YouTubeAnalysisError("api", body?.error?.message ?? "YouTube could not return data for this video.");
  }
  return body as T;
}

export async function fetchYouTubeAnalysis(url: string, maxComments = 200): Promise<AnalysisResult> {
  const id = extractYouTubeVideoId(url);
  if (!id || id.length < 8) throw new YouTubeAnalysisError("invalid_url", "Enter a valid YouTube video URL, such as youtube.com/watch?v=... or youtu.be/...");
  if (!ENV.youtubeApiKey) throw new YouTubeAnalysisError("missing_key", "Live analysis is not configured yet. Add YOUTUBE_API_KEY to the server environment, or use the built-in demo first.");
  const key = encodeURIComponent(ENV.youtubeApiKey);
  const videoData = await fetchJson<YouTubeVideoResponse>(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${encodeURIComponent(id)}&key=${key}`);
  const item = videoData.items?.[0];
  if (!item?.snippet?.title) throw new YouTubeAnalysisError("not_found", "That YouTube video could not be found or is not publicly accessible.");
  const comments: RawComment[] = [];
  let pageToken = "";
  while (comments.length < maxComments) {
    const pageSize = Math.min(100, maxComments - comments.length);
    const page = await fetchJson<YouTubeCommentResponse>(`https://www.googleapis.com/youtube/v3/commentThreads?part=snippet,replies&videoId=${encodeURIComponent(id)}&maxResults=${pageSize}&order=relevance${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""}&key=${key}`);
    for (const entry of page.items ?? []) {
      if (comments.length >= maxComments) break;
      const snippet = entry.snippet?.topLevelComment?.snippet;
      if (!snippet) continue;
      const parentId = entry.id ?? entry.snippet?.topLevelComment?.id;
      comments.push({
        id: parentId ?? `comment-${comments.length + 1}`,
        text: snippet.textOriginal ?? snippet.textDisplay ?? "",
        likeCount: snippet.likeCount,
        publishedAt: snippet.publishedAt,
        authorDisplayName: snippet.authorDisplayName,
      });
      const inlineReplies = entry.replies?.comments ?? [];
      for (const reply of inlineReplies) {
        if (comments.length >= maxComments) break;
        const replySnippet = reply.snippet;
        if (!replySnippet) continue;
        comments.push({
          id: reply.id ?? `reply-${comments.length + 1}`,
          text: replySnippet.textOriginal ?? replySnippet.textDisplay ?? "",
          likeCount: replySnippet.likeCount,
          publishedAt: replySnippet.publishedAt,
          authorDisplayName: replySnippet.authorDisplayName,
        });
      }
      if (parentId && (entry.snippet?.totalReplyCount ?? 0) > inlineReplies.length && comments.length < maxComments) {
        let replyPageToken = "";
        do {
          const replySize = Math.min(100, maxComments - comments.length);
          const replyPage = await fetchJson<YouTubeReplyResponse>(`https://www.googleapis.com/youtube/v3/comments?part=snippet&parentId=${encodeURIComponent(parentId)}&maxResults=${replySize}${replyPageToken ? `&pageToken=${encodeURIComponent(replyPageToken)}` : ""}&key=${key}`);
          for (const reply of replyPage.items ?? []) {
            if (comments.length >= maxComments) break;
            const replySnippet = reply.snippet;
            if (!replySnippet) continue;
            comments.push({
              id: reply.id ?? `reply-${comments.length + 1}`,
              text: replySnippet.textOriginal ?? replySnippet.textDisplay ?? "",
              likeCount: replySnippet.likeCount,
              publishedAt: replySnippet.publishedAt,
              authorDisplayName: replySnippet.authorDisplayName,
            });
          }
          replyPageToken = replyPage.nextPageToken ?? "";
        } while (replyPageToken && comments.length < maxComments);
      }
    }
    if (!page.nextPageToken || !(page.items?.length)) break;
    pageToken = page.nextPageToken;
  }
  return analyzeRawComments(comments, {
    id,
    url,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle ?? "YouTube creator",
    thumbnail: item.snippet.thumbnails?.high?.url ?? item.snippet.thumbnails?.medium?.url,
    publishedAt: item.snippet.publishedAt,
    viewCount: Number(item.statistics?.viewCount ?? 0),
    commentCount: Number(item.statistics?.commentCount ?? 0),
  }, "youtube");
}

export function createDemoAnalysis(url: string): AnalysisResult {
  const id = extractYouTubeVideoId(url) ?? "demo-marathi-video";
  return analyzeRawComments(DEMO_COMMENTS, {
    id,
    url,
    title: "Marathi YouTube sentiment demo",
    channelTitle: "Sample Marathi channel",
    thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    viewCount: 12840,
    commentCount: DEMO_COMMENTS.length,
  }, "demo");
}

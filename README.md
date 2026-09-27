# Marathi Lens — YouTube Comment Analyzer

A full-stack Marathi NLP dashboard that accepts a YouTube video URL, retrieves public comments through the official YouTube Data API, and classifies sentiment and emotion.

## What the user does

1. Paste a YouTube video URL.
2. Click **Analyze comments**.
3. The server retrieves up to 200 public comments.
4. Marathi language signals are selected and classified.
5. The dashboard shows sentiment balance, emotion fingerprint, repeated words, and comment examples.

The results also include a small TF-IDF + Naive Bayes holdout comparison, Roman-script Marathi detection (for phrases such as `khup chan video`), and one-click JSON/CSV downloads for your project report.

There is no CSV upload in the user workflow. The browser sends only the URL to the server; the API key never reaches the browser.

## Live setup

Add this server-side environment variable through the project secret settings:

```text
YOUTUBE_API_KEY=your_google_cloud_youtube_data_api_key
```

The key needs access to **YouTube Data API v3**. The application uses the `videos.list` and `commentThreads.list` endpoints.

If comments are disabled, the app shows a friendly error. If the key is absent, the app keeps working in demo mode and explains how to enable live mode.

## Local checks

```bash
pnpm check
pnpm test
pnpm build
```

## NLP approach

- URL parsing for common YouTube formats
- Marathi / mixed-language heuristic filtering
- Regex cleanup and tokenization
- Marathi stop-word removal
- Explainable lexicon sentiment scoring with negation handling
- Rule-based emotion scoring
- TF-IDF + Naive Bayes comparison panel with a transparent weak-label disclaimer
- Recharts visualizations for the dashboard

This transparent baseline is intentionally suitable for an academic minor project and can later be upgraded with TF-IDF + Naive Bayes or IndicBERT.

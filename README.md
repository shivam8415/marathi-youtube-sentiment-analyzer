# Marathi Lens — YouTube Comment Analyzer

A full-stack Marathi NLP dashboard that accepts a YouTube video URL, retrieves public comments through the official YouTube Data API, and classifies sentiment and emotion.

## What the user does

1. Paste a YouTube video URL.
2. Click **Analyze comments**.
3. The server paginates toward YouTube’s reported total public comments, including replies, with a 5,000-comment safety ceiling.
4. Marathi language signals are selected and classified; the dashboard also shows the fetched total separately.
5. The dashboard shows sentiment balance, emotion fingerprint, repeated words, and comment examples.

The results also include a small TF-IDF + Naive Bayes holdout comparison, Roman-script Marathi detection (for phrases such as `khup chan video`), and one-click JSON/CSV downloads for your project report.

The project includes a balanced **1,500-row real sample** from L3Cube-MahaSent-MD in `server/marathi-real-dataset.ts` (500 positive, 500 negative, 500 neutral). It is used for TF-IDF + Naive Bayes training and holdout evaluation; live dashboards never pad or invent YouTube comments. If comments are unavailable, moderated, or deleted, the app reports the actual returned count.

There is no CSV upload in the user workflow. The browser sends only the URL to the server; the API key never reaches the browser.

## Live setup

Add this server-side environment variable through the project secret settings:

```text
YOUTUBE_API_KEY=your_google_cloud_youtube_data_api_key
```

The key needs access to **YouTube Data API v3**. The application uses `videos.list`, `commentThreads.list`, and `comments.list` for reply pagination.

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
- TF-IDF + Naive Bayes evaluation panel with accuracy, precision, recall, macro-F1, and confusion matrix
- Downloadable annotation template for manually labeling 100–150 real YouTube comments
- Recharts visualizations for the dashboard

This transparent baseline is intentionally suitable for an academic minor project and can later be upgraded with a real Marathi corpus or IndicBERT. See [MARATHI_NLP_RESOURCES.md](MARATHI_NLP_RESOURCES.md) for verified real datasets, tools, API references, and licensing caveats.

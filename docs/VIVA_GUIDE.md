# Viva and presentation guide

## One-minute project explanation

Marathi Lens is a full-stack Marathi NLP system for analyzing public YouTube comments. The user provides a YouTube URL, the Node.js server retrieves comments and replies through YouTube Data API v3, and the NLP pipeline cleans the text, detects Marathi or Roman-Marathi signals, assigns explainable sentiment and emotion labels, and displays aggregate results in a React dashboard. A separate TF-IDF benchmark compares Naive Bayes and Logistic Regression on a 1,500-example labelled Marathi sample.

## Important distinction

The live dashboard is rule-based and explainable. The dataset-backed Naive Bayes and Logistic Regression models are a separate academic comparison. Live YouTube comments are not silently treated as labelled training data.

## Questions and short answers

### Where is preprocessing?

Open `server/analyzer.ts` and show `cleanText()` and `tokenize()`. Cleaning removes URLs, mentions, control characters, and repeated spaces. Tokenization extracts Devanagari, Latin, and numeric tokens.

### Where is the dataset?

Open `server/marathi-real-dataset.ts`. It contains the balanced 1,500-row labelled Marathi sample. The CSV inspection copy is under `server/data/`.

### Where is training performed?

Open the model-comparison helpers in `server/analyzer.ts`. The application creates TF-IDF-style vectors, trains Naive Bayes and Logistic Regression on the training portion, and evaluates the holdout portion at runtime.

### Why use rule-based sentiment?

It is transparent and suitable for a small academic project. A professor can inspect the word lists, weights, negation handling, and thresholds. It also avoids claiming that unlabelled live comments were used as supervised training data.

### What is TF-IDF?

TF-IDF gives a higher value to a term that is important in one document but not common in every document. It converts text into numeric features for the classical machine-learning comparison.

### What is the input and output?

Input: a public YouTube URL. Output: fetched-comment counts, language categories, sentiment distribution, emotion distribution, frequent words, preprocessing examples, model metrics, comment-level labels, and CSV/JSON downloads.

### Why can the fetched count be lower than YouTube's total?

The API may not return deleted, moderated, hidden, unavailable, or restricted comments. The application reports both the API-reported total and the accessible fetched total instead of inventing missing data.

## Suggested presentation order

1. Problem statement and motivation for Marathi regional-language NLP.
2. User workflow: URL → API retrieval → preprocessing → classification → dashboard.
3. Architecture and technology stack.
4. Preprocessing demonstration using one Marathi or Roman-Marathi comment.
5. Rule-based sentiment and emotion example.
6. Dataset-backed TF-IDF model comparison.
7. Live/demo dashboard walkthrough.
8. Testing, limitations, and future work.

## Code locations to show on screen

- `client/src/pages/Home.tsx` — user interface, charts, filters, and downloads.
- `server/routers.ts` — tRPC analysis endpoint.
- `server/analyzer.ts` — retrieval integration, preprocessing, rules, and benchmark.
- `server/marathi-real-dataset.ts` — labelled training sample.
- `server/_core/env.ts` — server environment variables.
- `server/analyzer.test.ts` — NLP and model tests.

# Marathi Lens — Marathi YouTube Comment Analyzer

Marathi Lens is a full-stack NLP mini-project that accepts a YouTube video URL, retrieves publicly available comments through the official YouTube Data API v3, and analyzes Marathi, Roman-Marathi, and mixed-language viewer feedback.

It was designed as an explainable academic project rather than a black-box production classifier. The live analysis uses transparent preprocessing, language-signal detection, weighted sentiment lexicons, negation handling, and emotion rules. A separate benchmark compares TF-IDF + Naive Bayes and TF-IDF + Logistic Regression on a labelled Marathi sentiment sample.

## Project at a glance

| Area | Implementation |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS, Recharts |
| Backend | Node.js, Express, tRPC |
| Data source | YouTube Data API v3 (`videos.list`, `commentThreads.list`, `comments.list`) |
| NLP | Unicode-aware cleaning, tokenization, Marathi/Roman-Marathi signals, lexicon scoring, negation, emotion rules |
| ML comparison | TF-IDF features with Naive Bayes and Logistic Regression |
| Testing | Vitest, TypeScript type-checking, production build validation |
| Reports | Academic DOCX/PDF report, diagrams, related-paper and resource guides |

## What the application does

1. The user pastes a YouTube watch, shorts, embed, live, or short URL.
2. The server extracts the video ID and requests video metadata and the reported public-comment total.
3. Comment threads and replies are paginated, deduplicated by comment ID, and kept separate from unavailable or moderated comments.
4. Each comment is cleaned and tokenized. Marathi Devanagari and Roman-Marathi signals are calculated without pretending that every comment is Marathi.
5. Marathi-signal comments receive explainable sentiment and emotion labels.
6. The dashboard displays counts, sentiment balance, emotion distribution, frequent words, language categories, preprocessing examples, model-comparison metrics, a searchable comment browser, and CSV/JSON downloads.
7. If a YouTube API key is not configured, the built-in demo mode still demonstrates the complete analysis interface.

The application does **not** require a CSV upload from the user and does not invent comments when YouTube returns fewer accessible comments than its reported total.

## Screenshots and diagrams

The repository includes black-and-white academic figures in [`docs/screenshots`](docs/screenshots):

### Dashboard concept

![Marathi Lens dashboard](docs/screenshots/dashboard-overview.png)

### Data collection and NLP pipeline

![Data collection and NLP pipeline](docs/screenshots/nlp-pipeline.png)

### Explainable model comparison

![Model comparison diagram](docs/screenshots/model-comparison.png)

More details and captions are available in [`docs/SCREENSHOTS.md`](docs/SCREENSHOTS.md).

## Quick start on Windows, macOS, or Linux

### Requirements

- Node.js 20 or newer
- pnpm 10 or newer
- A Google Cloud project with YouTube Data API v3 enabled for live analysis

Install pnpm if required:

```bash
npm install --global pnpm
```

### Install and configure

```bash
git clone https://github.com/shivam8415/marathi-youtube-sentiment-analyzer.git
cd marathi-youtube-sentiment-analyzer
pnpm install
```

Create a local environment file from the safe template:

```bash
copy ENVIRONMENT_TEMPLATE.txt .env        # Windows PowerShell/cmd
# cp ENVIRONMENT_TEMPLATE.txt .env       # macOS/Linux
```

Set the server-side API key in `.env`:

```text
YOUTUBE_API_KEY=your_google_cloud_youtube_data_api_key
```

Never commit `.env` or place an API key in frontend code. The key is read by the server only.

### Run in development

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

Use **Demo analysis** to test the interface without a key. For a live scan, paste a public YouTube URL and choose **Analyze comments**.

### Validate the project

```bash
pnpm check
pnpm test
pnpm build
```

To run the production bundle after building:

```bash
pnpm start
```

## Google YouTube API setup

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project.
3. Enable **YouTube Data API v3**.
4. Create an API key.
5. Put the key in the server-side `.env` file as `YOUTUBE_API_KEY`.
6. Restart `pnpm dev` after changing environment variables.

The application uses:

- `videos.list` for metadata and the reported comment count.
- `commentThreads.list` for top-level comments and available first replies.
- `comments.list` for complete reply pagination where permitted by the API.

Some comments can remain inaccessible because of moderation, deletion, disabled comments, privacy settings, API restrictions, or quota limits.

## NLP and machine-learning workflow

```text
YouTube URL
    ↓
Video ID and metadata
    ↓
Paginated comment threads and replies
    ↓
Deduplication by comment ID
    ↓
HTML/entity cleanup and regex filtering
    ↓
Unicode-aware tokenization
    ↓
Marathi / Roman-Marathi signal detection
    ↓
Lexicon sentiment + negation + emotion rules
    ↓
Aggregated dashboard and downloadable reports
```

### Rule-based live analysis

The live dashboard uses manually defined, weighted Marathi, Roman-Marathi, and English terms. Positive terms increase a positive score, negative terms increase a negative score, and negation words such as `नाही`, `नको`, `not`, and `never` can reverse a nearby term. Threshold rules then assign **Positive**, **Negative**, or **Neutral**. Emotion dictionaries produce categories such as happiness, sadness, anger, fear, surprise, and love when matching signals are found.

This approach is intentionally easy to explain during a viva: the system follows visible rules rather than claiming that a deep-learning model was trained on the live comments.

### Dataset-backed benchmark

The benchmark dataset is stored in:

- [`server/marathi-real-dataset.ts`](server/marathi-real-dataset.ts) — 1,500 labelled Marathi examples, balanced across positive, negative, and neutral classes.
- [`server/data/MahaSent_MD_real_sample.csv`](server/data/MahaSent_MD_real_sample.csv) — the corresponding tabular sample for inspection and academic reference.

The benchmark pipeline cleans and tokenizes the labelled text, builds TF-IDF-style features, splits examples into training and holdout portions, trains Naive Bayes and Logistic Regression, and reports accuracy, precision, recall, macro-F1, and a confusion matrix. This benchmark is separate from the live rule-based labels because live YouTube comments do not arrive with verified sentiment annotations.

## Where to find each important part of the code

| Viva topic | File or function |
|---|---|
| YouTube URL parsing and API retrieval | `server/routers.ts` and `server/analyzer.ts` |
| Text preprocessing | `cleanText()` and `tokenize()` in `server/analyzer.ts` |
| Marathi and Roman-Marathi detection | `isMarathi()` and language-signal helpers in `server/analyzer.ts` |
| Sentiment rules | `classifySentiment()` and lexicon constants in `server/analyzer.ts` |
| Negation handling | negation helpers used by sentiment scoring in `server/analyzer.ts` |
| Emotion rules | `classifyEmotion()` and emotion dictionaries in `server/analyzer.ts` |
| TF-IDF benchmark | model-comparison helpers in `server/analyzer.ts` |
| Training data | `server/marathi-real-dataset.ts` |
| API environment configuration | `server/_core/env.ts` |
| Dashboard and charts | `client/src/pages/Home.tsx` |
| Shared API types | `shared/types.ts` |
| Automated tests | `server/analyzer.test.ts` and related `server/*.test.ts` files |
| Academic report | `reports/` |

## Repository structure

```text
client/
  src/pages/Home.tsx       React dashboard and result rendering
  src/components/          Reusable UI components
server/
  analyzer.ts              NLP preprocessing, rules, and model benchmark
  routers.ts               tRPC procedures and YouTube analysis endpoint
  marathi-real-dataset.ts  1,500-row labelled benchmark sample
  data/                    CSV version of the Marathi sample
  _core/env.ts             Server environment configuration
shared/
  types.ts                 Shared request/response types
reports/
  figures/                 Academic diagrams and UI figure
  pdf/                     Final PDF reports
  *.docx                   Editable Word reports
docs/
  screenshots/             README-friendly copies of project figures
  SCREENSHOTS.md           Figure captions and interpretation
  VIVA_GUIDE.md            Short presentation and viva notes
```

## Academic deliverables

- [Final mini-project report — PDF](reports/pdf/Marathi_YouTube_Sentiment_Emotion_Detection_Mini_Project_Report.pdf)
- [Final mini-project report — DOCX](reports/Marathi_YouTube_Sentiment_Emotion_Detection_Mini_Project_Report.docx)
- [Report-format PDF](reports/pdf/Marathi_YouTube_Sentiment_Emotion_Detection_Format_Report.pdf)
- [Related reference papers](RELATED_REFERENCE_PAPERS.md)
- [Marathi NLP resources and datasets](MARATHI_NLP_RESOURCES.md)
- [Viva-ready explanation guide](docs/VIVA_GUIDE.md)

## Limitations and honest reporting

- YouTube's reported total can be larger than the accessible API response because comments may be deleted, moderated, hidden, or unavailable.
- Live labels are explainable predictions, not gold annotations. A manually labelled YouTube test set is required for a final domain-specific accuracy claim.
- Roman-Marathi spelling is inconsistent, and sarcasm, emojis, very short replies, and Marathi-English code-mixing remain difficult cases.
- The L3Cube-MahaSent-MD sample is a Marathi benchmark corpus, not a dedicated YouTube-comment gold dataset. Benchmark results and live-video results should be reported separately.
- API quota, disabled comments, network failures, and invalid/private URLs can prevent live retrieval.

## License and responsible use

This project is released under the [MIT license](LICENSE). Use the YouTube API according to Google's terms and respect user privacy. The repository contains no API key or private comment data; live comments are retrieved only when a user supplies a URL during analysis.

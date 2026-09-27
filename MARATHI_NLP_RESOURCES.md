# Marathi NLP Resources for the YouTube Sentiment Project

## Important distinction

The app now trains on a balanced **1,500-row real sample** extracted from the L3Cube-MahaSent-MD training split. The original 150-row corpus remains in the repository only as a transparent fallback/demo seed and is not presented as a real YouTube dataset.

For a credible academic result:

- Use a real Marathi corpus for initial training or benchmarking.
- Collect the actual YouTube comments from the target videos.
- Manually label a held-out YouTube sample for final evaluation.
- Report transfer performance separately from YouTube-specific performance.

No verified public resource found in this review is a dedicated Marathi YouTube-comment gold dataset.

## Recommended real datasets

### 1. L3Cube-MahaSent-MD — best overall starting point

- Repository: https://github.com/l3cube-pune/MarathiNLP/tree/main/L3Cube-MahaSent-MD
- Paper: https://aclanthology.org/2023.paclic-1.28/
- Approx. 60,000 Marathi examples across four domains:
  - movie reviews
  - TV subtitles
  - generic tweets
  - political tweets
- Labels: Positive, Negative, Neutral
- Human annotation by native Marathi speakers with reported agreement.
- Useful files include train, validation, and test splits.
- Why it helps: the generic-tweet subset is a reasonable proxy for YouTube comments, while the subtitle subset helps with spoken-style language.
- Caveat: it is not YouTube data, so domain shift must be measured.
- License note: the L3Cube repository states CC BY-NC-SA 4.0 for research use. Preserve attribution and verify source-content restrictions before redistribution.

### 2. L3Cube-MahaSent — smaller published baseline

- Repository: https://github.com/l3cube-pune/MarathiNLP/tree/main/L3CubeMahaSent%20Dataset
- Paper: https://aclanthology.org/2021.wassa-1.23/
- Marathi social-media sentiment corpus with Positive, Negative, and Neutral labels.
- Official repository provides train, validation, test, and extra CSV splits.
- Why it helps: good for reproducing a published three-class baseline with a smaller dataset.
- Caveat: it is mainly Twitter/political social text, not YouTube comments.
- License note: repository states CC BY-NC-SA 4.0 for research purposes.

### 3. L3Cube-MahaEmotions — emotion resource

- Dataset: https://huggingface.co/datasets/l3cube-pune/MahaEmotions
- Repository: https://github.com/l3cube-pune/MarathiNLP/tree/main/L3Cube-MahaEmotions
- Paper: https://arxiv.org/html/2506.00863v2
- Approx. 15,000 Marathi sentences with 11 labels:
  - Happiness, Sadness, Respect, Anger, Fear, Surprise
  - Disgust, Excitement, Pride, Sarcasm, Neutral
- Important provenance: the training split is GPT-4/Chain-of-Translation synthetically labeled; validation and test splits are manually labeled.
- Best use: use the human validation/test splits for evaluation and clearly report the synthetic-label caveat.
- Caveat: source text is Marathi social text, not YouTube.
- License note: verify the current dataset card and repository terms before redistribution; do not automatically assume the sentiment dataset license applies.

### 4. MeSent — Roman Marathi / Marathi-English code-mixing

- Repository: https://github.com/l3cube-pune/MarathiNLP/tree/main/MeEval/L3Cube-MeSent
- Paper: https://arxiv.org/abs/2306.14030
- Approx. 12,000 manually annotated code-mixed Marathi-English tweets.
- Labels: Positive, Negative, Neutral.
- Why it helps: YouTube comments often contain Roman Marathi such as `khup chan video` and Marathi-English mixing.
- Caveat: still Twitter-derived, not YouTube-specific.
- License note: repository states CC BY-NC-SA 4.0 for research purposes.

## Useful Marathi NLP tools

### Indic NLP Library

- https://github.com/anoopkunchukuttan/indic_nlp_library
- Resources: https://github.com/anoopkunchukuttan/indic_nlp_resources
- Useful for normalization, tokenization, sentence splitting, transliteration, romanization, script conversion, and Marathi preprocessing.
- Typical installation: `pip install indic-nlp-library`
- License note: the current repository README says MIT; older hosted documentation may show different wording, so verify the exact checkout used.

### mahaNLP

- https://pypi.org/project/mahaNLP/
- Marathi-focused Python toolkit with preprocessing and sentiment interfaces.
- It can provide a low-code baseline using L3Cube Marathi models.
- Check the package, model, and dataset licenses separately.

## Official YouTube collection guidance

### Comment threads

- https://developers.google.com/youtube/v3/docs/commentThreads/list
- Use `maxResults=100` per request and repeat with `nextPageToken`.
- Request `part=snippet,replies`.
- `replies.comments` may contain only a subset of replies, so use `comments.list` with `parentId` when `totalReplyCount` is larger than the inline reply count.

### Reply comments

- https://developers.google.com/youtube/v3/docs/comments/list
- Paginate replies with `nextPageToken`.
- Deduplicate by comment ID when combining top-level comments and replies.

### Quota

- https://developers.google.com/youtube/v3/determine_quota_cost
- Default general allocation is 10,000 quota units/day.
- `commentThreads.list` and `comments.list` cost 1 unit per request, and every additional page costs again.
- A video cannot be forced to produce 100–150 comments if fewer public comments exist. The app now targets up to 150 real comments and reports the actual available total.

## Recommended academic experiment

1. Train a baseline on L3Cube-MahaSent-MD.
2. Add MeSent for Roman/code-mixed robustness.
3. Add MahaEmotions for the emotion head, using human validation/test as the primary evaluation reference.
4. Collect 100–150 real comments from several Marathi YouTube videos where available.
5. Manually annotate sentiment and emotion for a held-out sample.
6. Report accuracy, precision, recall, macro-F1, and a confusion matrix.
7. Compare:
   - rule-based baseline
   - TF-IDF + Multinomial Naive Bayes
   - optional Marathi transformer model
8. Clearly state that benchmark-corpus results and YouTube results are different experiments.

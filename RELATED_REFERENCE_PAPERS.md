# Related Reference Papers

These sources were selected for the project **Marathi Sentiment and Emotion Detection System of YouTube Videos**.

1. **Kulkarni et al. (2021), “L3CubeMahaSent: A Marathi Tweet-based Sentiment Analysis Dataset.”** WASSA, ACL, pp. 213–220. [Official ACL page](https://aclanthology.org/2021.wassa-1.23/). Marathi positive/negative/neutral benchmark of approximately 16,000 tweets. Useful for sentiment baseline training; it is not YouTube-specific.

2. **Kowtal and Joshi (2025), “L3Cube-MahaEmotions: A Marathi Emotion Recognition Dataset with Synthetic Annotations using CoTR prompting and Large Language Models.”** PACLIC 39, ACL, pp. 419–427. [Official ACL page](https://aclanthology.org/2025.paclic-1.38/). Marathi 11-category emotion resource. Synthetic training labels and a different domain require careful validation.

3. **Chavan et al. (2023), “My Boli: Code-mixed Marathi-English Corpora, Pretrained Language Models and Evaluation Benchmarks.”** Findings of IJCNLP-AACL, pp. 242–249. [ACL page](https://aclanthology.org/2023.findings-ijcnlp.22/). Directly relevant to Roman Marathi and Marathi-English code-mixing.

4. **Doddapaneni et al. (2023), “Towards Leaving No Indic Language Behind: Building Monolingual Corpora, Benchmark and Models for Indic Languages.”** ACL 2023. [ACL page](https://aclanthology.org/2023.acl-long.693/). Introduces IndicCorp, IndicXTREME, and IndicBERT v2, with Marathi coverage.

5. **Khanuja et al. (2021), “MuRIL: Multilingual Representations for Indian Languages.”** arXiv:2103.10730. [Paper](https://arxiv.org/abs/2103.10730). Relevant for transliterated and multilingual Indian-language text, including Marathi.

6. **Abeera V. P., Kumar, and Soman (2023), “Social Media Data Analysis for Malayalam YouTube Comments: Sentiment Analysis and Emotion Detection using ML and DL Models.”** DravidianLangTech 2023, pp. 43–51. [ACL page](https://aclanthology.org/2023.dravidianlangtech-1.6/). A close regional-language YouTube methodology precedent; Malayalam results should not be treated as Marathi results.

7. **Demszky et al. (2020), “GoEmotions: A Dataset of Fine-Grained Emotions.”** ACL 2020. [ACL page](https://aclanthology.org/2020.acl-main.372/). Useful for designing emotion labels and annotation guidance, but it is English Reddit data.

8. **Jurafsky and Martin, _Speech and Language Processing_, 2nd ed.** Prentice Hall, 2009. Background reference for tokenization, language models, tagging, parsing, and sentiment-related NLP concepts.

9. **Manning and Schütze, _Foundations of Statistical Natural Language Processing_.** MIT Press, 1999. Background reference for probabilistic language processing and statistical NLP models.

10. **Google, “YouTube Data API v3: CommentThreads and Comments resources.”** [Official documentation](https://developers.google.com/youtube/v3/docs/commentThreads). Technical source for public comment-thread and reply retrieval.

## Recommended use in the report

- Cite **[1]** for the Marathi sentiment benchmark and dataset limitations.
- Cite **[2]** for Marathi emotion taxonomy and emotion-evaluation direction.
- Cite **[3]** for Roman Marathi and code-mixed Marathi-English handling.
- Cite **[4]** and **[5]** in future scope for IndicBERT v2 and MuRIL.
- Cite **[6]** as the closest regional-language YouTube sentiment/emotion comparison.
- Cite **[7]** for general fine-grained emotion-label design.
- Cite **[10]** for the implementation’s YouTube API collection method.

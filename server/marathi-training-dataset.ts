export type TrainingExample = {
  text: string;
  sentiment: "positive" | "negative" | "neutral";
  emotion: "happy" | "sad" | "angry" | "fear" | "surprise" | "neutral";
};

const subjects = [
  "या व्हिडिओची माहिती",
  "तुमचे सादरीकरण",
  "हा भाग",
  "हा कार्यक्रम",
  "तुमचे काम",
];

function expand(
  sentiment: TrainingExample["sentiment"],
  emotion: TrainingExample["emotion"],
  templates: string[],
): TrainingExample[] {
  return templates.flatMap((template) => subjects.map((subject) => ({
    text: template.replace("{subject}", subject),
    sentiment,
    emotion,
  })));
}

/**
 * Curated seed corpus for the minor project. It is intentionally transparent
 * and bundled so the app can demonstrate model training without a CSV upload.
 * Replace or extend it with manually annotated YouTube comments for final
 * academic evaluation.
 */
export const MARATHI_TRAINING_DATASET: TrainingExample[] = [
  ...expand("positive", "happy", [
    "{subject} खूप छान आहे.",
    "{subject} मला खूप आवडले.",
    "{subject} सुंदर आणि माहितीपूर्ण आहे.",
    "{subject} पाहून खूप आनंद झाला.",
    "{subject} अप्रतिम आणि उत्कृष्ट आहे.",
    "{subject} मस्त केले आहे, धन्यवाद.",
    "{subject} खूप उपयुक्त आणि सोपे आहे.",
    "{subject} पाहताना खूप मजा आली.",
    "{subject} खरंच लाजवाब आहे.",
    "{subject} सगळ्यांनी नक्की पाहावे.",
  ]),
  ...expand("negative", "angry", [
    "{subject} अजिबात चांगले नाही.",
    "{subject} खूप वाईट आणि निराशाजनक आहे.",
    "{subject} मला अजिबात आवडले नाही.",
    "{subject} फालतू आणि चुकीचे आहे.",
    "{subject} पाहून खूप राग आला.",
    "{subject} कंटाळवाणे आणि वेळ वाया घालवणारे आहे.",
    "{subject} मध्ये खूप चुका आहेत.",
    "{subject} खोटे आणि दिशाभूल करणारे आहे.",
    "{subject} खराब पद्धतीने सादर केले आहे.",
    "{subject} मुळे प्रेक्षकांची निराशा झाली.",
  ]),
  ...expand("neutral", "neutral", [
    "{subject} ठीक आहे.",
    "{subject} साधारण स्वरूपाचे आहे.",
    "{subject} बद्दल अधिक माहिती हवी.",
    "{subject} मध्ये काही चांगले मुद्दे आहेत.",
    "{subject} पाहिला, पण विशेष प्रतिक्रिया नाही.",
    "{subject} अपेक्षेप्रमाणे आहे.",
    "{subject} मध्ये अजून उदाहरणे देता आली असती.",
    "{subject} समजण्यासाठी पुन्हा पाहावे लागेल.",
    "{subject} सामान्य वाटतो.",
    "{subject} बद्दल माझे मत तटस्थ आहे.",
  ]),
];

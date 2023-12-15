export type B64Image = string;

export type ImageGeneration = (openAiKey: string, prompt: string) => Promise<B64Image>;
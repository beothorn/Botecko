export type B64Image = string;

export const ImageProviders = ['dall-e-2', 'dall-e-3'] as const;
export type ImageProvider = typeof ImageProviders[number];

export type ImageGeneration = (openAiKey: string, prompt: string) => Promise<B64Image>;
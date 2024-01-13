import { Settings } from "../AppState";
import { imageGenerationDalle2, imageGenerationDalle3 } from "./client/OpenAiApi";

export type B64Image = string;

export const ImageProviders = ['dall-e-2', 'dall-e-3'] as const;
export type ImageProvider = typeof ImageProviders[number];

export type ImageGeneration = (openAiKey: string, model: string, size: string, prompt: string) => Promise<B64Image>;
export type ImageGenerationDefaultModel = (openAiKey: string, prompt: string) => Promise<B64Image>;

function assertUnreachable(_x: never): never {
    throw new Error("Didn't expect to get here");
}

export function getCurrentImageGeneration(settings: Settings): (avatarPrompt: string) => Promise<B64Image> {
    switch (settings.avatarGeneration) {
        case 'dall-e-2':
            return (avatarPrompt: string) => imageGenerationDalle2(settings.openAiKey, avatarPrompt);
        case 'dall-e-3':
            return (avatarPrompt: string) => imageGenerationDalle3(settings.openAiKey, avatarPrompt);
    }
    return assertUnreachable(settings.avatarGeneration);
}
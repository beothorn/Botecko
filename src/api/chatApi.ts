import { MetaFromAI } from '../dispatches';
import { ChatMessageContent, Settings } from '../AppState';
import { chatCompletion as chatCompletionGemini, directQuery as directQueryGemini, 
    extractAIChatResponse as extractAIChatResponseGemini, 
    extractAIProfileResponse as extractAIProfileResponseGemini  } from "./client/GeminiAPI";
import { extractAIChatResponse as extractAIChatResponseOpenAi,
    extractAIProfileResponse as extractAIProfileResponseOpenAi, 
    chatCompletionGPT3, chatCompletionGPT4} from "./client/OpenAiApi";


export type RoleType = 'user' | 'system' | 'assistant';

export const TextProviders = ['gpt-3.5-turbo', 'gpt-4', 'gemini-pro']  as const;
export type TextProvider = typeof TextProviders[number];

export type Message = {
    role: RoleType;
    content: string;
};

export type ChatCompletion = (apiKey: string, model: string, messages: Message[]) => Promise<Message>;
export type ChatCompletionDefaultModel = (apiKey: string, messages: Message[]) => Promise<Message>;
export type DirectQuery = (apiKey: string, query: string) => Promise<Message>; 
export type ExtractAIProfileResponse = (response: any) => MetaFromAI;
export type ExtractAIChatResponse = (response: any) => ChatMessageContent; 

function assertUnreachable(_x: never): never {
    throw new Error("Didn't expect to get here");
}

function generateContact(profileDescription: string, profileGeneratorSystem: string, profileGeneratorMessage: string): Message[] {
    return [
        { "role": "system", "content": profileGeneratorSystem },
        { "role": "user", "content": profileGeneratorMessage.replaceAll('%PROFILE%', profileDescription) }
    ]
}

function generateContactString(profileDescription: string, profileGeneratorSystem: string, profileGeneratorMessage: string): string {
    const asMessages: Message[] = generateContact(profileDescription, profileGeneratorSystem, profileGeneratorMessage);
    return `${asMessages[0].content} ${asMessages[1].content}`;
}

export function getChatCompletion(settings: Settings): (finalPrompt: Message[]) => Promise<Message> {
    switch (settings.chatResponse) {
        case 'gpt-3.5-turbo':
            return (finalPrompt: Message[]) => chatCompletionGPT3(settings.openAiKey, finalPrompt);
        case 'gpt-4':
            return (finalPrompt: Message[]) => chatCompletionGPT4(settings.openAiKey, finalPrompt);
        case 'gemini-pro':
            return (finalPrompt: Message[]) => chatCompletionGemini(settings.geminiKey, finalPrompt);
    }
    return assertUnreachable(settings.chatResponse);
}

export function getChatResponse(configuredResponseModel: TextProvider): (response: any) => ChatMessageContent {
    switch (configuredResponseModel) {
        case 'gpt-3.5-turbo':
            return extractAIChatResponseOpenAi;
        case 'gpt-4':
            return extractAIChatResponseOpenAi;
        case 'gemini-pro':
            return extractAIChatResponseGemini;
    }
    return assertUnreachable(configuredResponseModel);
}

export function getProfileResponse(configuredResponseModel: TextProvider): (response: any) => MetaFromAI {
    switch (configuredResponseModel) {
        case 'gpt-3.5-turbo':
            return extractAIProfileResponseOpenAi;
        case 'gpt-4':
            return extractAIProfileResponseOpenAi;
        case 'gemini-pro':
            return extractAIProfileResponseGemini;
    }
    return assertUnreachable(configuredResponseModel);
}

export function getCurrentGenerateContact(settings: Settings): (contactDescription: string) => Promise<Message> {
    switch (settings.profileGeneration) {
        case 'gpt-3.5-turbo':
            return (contactDescription: string) => chatCompletionGPT3(settings.openAiKey, generateContact(
                contactDescription,
                settings.profileGeneratorSystemEntry,
                settings.profileGeneratorMessageEntry));
        case 'gpt-4':
            return (contactDescription: string) => chatCompletionGPT4(settings.openAiKey, generateContact(
                contactDescription,
                settings.profileGeneratorSystemEntry,
                settings.profileGeneratorMessageEntry));
        case 'gemini-pro':
            return (contactDescription: string) => directQueryGemini(settings.geminiKey, generateContactString(
                contactDescription,
                settings.profileGeneratorSystemEntry,
                settings.profileGeneratorMessageEntry));
    }
    return assertUnreachable(settings.profileGeneration);
}
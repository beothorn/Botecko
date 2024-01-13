import { MetaFromAI } from '../dispatches';
import { ChatMessageContent } from '../AppState';

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

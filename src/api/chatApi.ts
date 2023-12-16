import { MetaFromAI } from '../dispatches';
import { ChatMessageContent } from '../AppState';

export type RoleType = 'user' | 'system' | 'assistant';

export type Message = {
    role: RoleType;
    content: string;
};

export type ChatCompletion = (apiKey: string, messages: Message[]) => Promise<Message>;
export type DirectQuery = (apiKey: string, query: string) => Promise<Message>; 
export type ExtractAIProfileResponse = (response: any) => MetaFromAI;
export type ExtractAIChatResponse = (response: any) => ChatMessageContent; 

export type RoleType = 'user' | 'system' | 'assistant';

export type Message = {
    role: RoleType;
    content: string;
};

export type ChatCompletion = (apiKey: string, messages: Message[]) => Promise<Message>; 
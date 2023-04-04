import axios from 'axios';
import { Settings } from './appStateSlice';

const openAiUrl = 'https://api.openai.com/v1';
const model = "gpt-4";

export type Message = {
    role: 'user' | 'system' | 'assistant' | 'thought';
    content: string;
};

export const chatCompletion = (settings: Settings, messages: Message[]): Promise<Message> => axios.post(`${openAiUrl}/chat/completions`, {
    "model": model,
    "messages": messages
}, {
    headers: {
        'Authorization': `Bearer ${settings.openAiKey}`,
        'Content-Type': 'application/json'
    }
}).then((result) => {
    const response = result.data.choices[0].message;
    console.log(response);
    return response;
});

export const imageGeneration = (settings: Settings, prompt: string): Promise<string> => axios.post(`${openAiUrl}/images/generations`, {
    "prompt": prompt,
    "n": 1,
    "size": "256x256",
    "response_format": "b64_json"
}, {
    headers: {
        'Authorization': `Bearer ${settings.openAiKey}`,
        'Content-Type': 'application/json'
    }
}).then((result) => {
    console.log(result);
    const response = result.data.data[0].b64_json;
    return response;
});

export const listEngines = (settings: Settings) => axios.get(`${openAiUrl}/engines`, {
    headers: {
        'Authorization': `Bearer ${settings.openAiKey}`,
        'Content-Type': 'application/json'
    }
});

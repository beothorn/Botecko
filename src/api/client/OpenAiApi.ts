import axios from 'axios';
import { Message, ChatCompletion } from '../chatApi'
import { B64Image, ImageGeneration } from '../imageApi'

const openAiUrl = 'https://api.openai.com/v1';
const model = "gpt-4";

export const chatCompletion: ChatCompletion = (openAiKey: string, messages: Message[]): Promise<Message> => axios.post(`${openAiUrl}/chat/completions`, {
    "model": model,
    "messages": messages
}, {
    headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json'
    }
}).then((result) => {
    console.log(result.data);
    const response = result.data.choices[0].message;
    return response;
});

export const imageGeneration: ImageGeneration = (openAiKey: string, prompt: string): Promise<B64Image> => axios.post(`${openAiUrl}/images/generations`, {
    "prompt": prompt,
    "n": 1,
    "size": "256x256",
    "response_format": "b64_json"
}, {
    headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json'
    }
}).then((result) => {
    console.log(result.data);
    const response = result.data.data[0].b64_json;
    return response;
});

export const listEngines = (openAiKey: string) => axios.get(`${openAiUrl}/engines`, {
    headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json'
    }
});

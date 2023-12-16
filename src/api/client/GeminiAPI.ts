import axios from 'axios';
import { MetaFromAI } from '../../dispatches'
import { Message, ChatCompletion, DirectQuery, ExtractAIProfileResponse, ExtractAIChatResponse } from '../chatApi'
import { ChatMessageContent } from '../../AppState';
import { removeSpecialCharsAndParse } from "../../utils/ParsingUtils";


type GeminiRoleType = 'user' | 'model';

type GeminiPartTextOnly = {
    text: string
}

type GeminiMessage = {
    role?: GeminiRoleType;
    parts: GeminiPartTextOnly[];
};

const convertMessagesToGeminiMessage = (messages: Message[]): GeminiMessage[] => {
// Gemini is very sensitive to order, messages must be user - model - user (always starting with user)

    const geminiMessages: GeminiMessage[] = messages.map(m => ({
        role: (m.role !== 'user'? 'model': 'user'), 
        parts: [{
            text: m.content
        }]
    }));

    const geminiMessagesNormalized: GeminiMessage[] = []

    let previousMessage: GeminiMessage;

    if (geminiMessages[0].role != 'user') {
        geminiMessagesNormalized.push({
            role: "user",
            parts: [{text: ''}]
        });
    }

    previousMessage = geminiMessages[0];

    for (let index = 1; index < geminiMessages.length; index++) {
        const element = geminiMessages[index];
        if (previousMessage.role === element.role) {
            const msgJson = JSON.parse(element.parts[0].text);
            console.log(msgJson);
            const previousMessageMsgJson = JSON.parse(previousMessage.parts[0].text);
            previousMessageMsgJson.message = `${previousMessageMsgJson.message} ${msgJson.message}` ;
            previousMessage.parts[0].text = JSON.stringify(previousMessageMsgJson); 
        } else {
            geminiMessagesNormalized.push(previousMessage);
            previousMessage = element;
        }
    }
    geminiMessagesNormalized.push(previousMessage);

    return geminiMessagesNormalized;
}

export const chatCompletion: ChatCompletion = (apiKey: string, messages: Message[]): Promise<Message> => 
    axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
    "contents": convertMessagesToGeminiMessage(messages)
}, {
    headers: {
        'Content-Type': 'application/json'
    }
}).then((result) => {
    console.log(result.data);
    const response = result.data.candidates[0].content.parts[0].text;
    return {
        role: 'assistant',
        content: response
    };
});

export const directQuery: DirectQuery = (apiKey: string, query: string): Promise<Message> => 
    axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
    "contents": {
        "parts": [{
            "text": query
        }]
    }
}, {
    headers: {
        'Content-Type': 'application/json'
    }
}).then((result) => {
    console.log(result.data);
    const response = result.data.candidates[0].content.parts[0].text;
    return response;
});

export const extractAIProfileResponse: ExtractAIProfileResponse = (response: any): MetaFromAI => {
    return removeSpecialCharsAndParse(response);
}

export const extractAIChatResponse: ExtractAIChatResponse = (response: any): ChatMessageContent => {
    return JSON.parse(response.content);
}
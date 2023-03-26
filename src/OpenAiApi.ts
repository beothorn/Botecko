import axios from 'axios';


// post https://api.openai.com/v1/chat/completions


const openAiUrl = 'https://api.openai.com/v1';
//const msg = [{"role": "user", "content": "Hello!"}, {"role": "assistant", "content": "Hello!"}]

type Message = {
    role: 'user' | 'system' | 'assistant';
    content: string;
};

export const chatCompletion = (openAiKey: string, messages: Message[]): Promise<Message> => axios.post(`${openAiUrl}/chat/completions`, {
    "model": "gpt-4",
    "messages": messages
}, {
    headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json'
    }
}).then((result) => {
    const response = result.data.choices[0].message;
    console.log(response);
    return response;
});

export const listEngines = (openAiKey: string) => axios.get(`${openAiUrl}/engines`, {
    headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json'
    }
});
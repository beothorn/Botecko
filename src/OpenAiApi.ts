import axios from 'axios';

const openAiUrl = 'https://api.openai.com/v1';
const engine = 'text-davinci-002';

const getCompletionWithSize = (openAiKey: string, query: string, size: number) => axios.post(`${openAiUrl}/engines/${engine}/completions`, {
    "prompt": query,
    "max_tokens": size,
    "temperature": 0.9,
    "top_p": 1,
    "frequency_penalty": 0,
    "presence_penalty": 0,
}, {
    headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json'
    }
}).then((result) => {
    const text = result.data.choices[0].text.trim();
    console.log({query, text});
    return text;
});

export const getSmallCompletion = (openAiKey: string, query: string) => getCompletionWithSize(openAiKey, query, 30);

export const getCompletion = (openAiKey: string, query: string) => getCompletionWithSize(openAiKey, query, 256);

export const answerQuestion = (openAiKey: string, situation: string, question: string) => axios.post(`${openAiUrl}/engines/${engine}/completions`, {
    "prompt": `===
${situation}
===
From this scene:
${question}(yes or no)
`,
    "max_tokens": 3,
    "temperature": 0.9,
    "top_p": 1,
    "frequency_penalty": 0,
    "presence_penalty": 0,
}, {
    headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json'
    }
}).then((result) => {
    const text = result.data.choices[0].text.trim();
    console.log({query: `===
${situation}
===
From this scene:
${question}(yes or no)
`, text});
    return text.toLocaleLowerCase().includes('yes');
});

export const listEngines = (openAiKey: string) => axios.get(`${openAiUrl}/engines`, {
    headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json'
    }
});
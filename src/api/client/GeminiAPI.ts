import axios from 'axios';
import { Message, ChatCompletion } from '../chatApi'
import { B64Image, ImageGeneration } from '../imageApi'

// On Message, roletype 'assistant' must be converted to model

type GeminiRoleType = 'user' | 'model';

type GeminiPartTextOnly = {
    text: string
}

type GeminiMessage = {
    role: GeminiRoleType;
    parts: GeminiPartTextOnly[];
};

/**

curl https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent\?key\=blabla \            
    -H 'Content-Type: application/json' \
    -X POST \
    -d '{
      "contents": [
        {"role":"user",                                 
         "parts":[{
           "text": "Write the first line of a story about a magic backpack."}]},
        {"role": "model",
         "parts":[{
           "text": "In the bustling city of Meadow brook, lived a young girl named Sophie. She was a bright and curious soul with an imaginative mind."}]},
        {"role": "user",
         "parts":[{
           "text": "Can you set it in a quiet village in 1600s France?"}]},
      ]
    }'

RESPONSE

{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "In the heart of the tranquil village of Verdemere, nestled amidst the rolling hills of 1600s France, lived a young maiden named Antoinette. She possessed an insatiable thirst for knowledge and a heart brimming with curiosity.\n\nOne fateful day, as Antoinette wandered through the forest, she stumbled upon a hidden glen. There, nestled beneath a majestic oak tree, lay a satchel of worn leather, imbued with an aura of ancient magic."
          }
        ],
        "role": "model"
      },
      "finishReason": "STOP",
      "index": 0,
      "safetyRatings": [
        {
          "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          "probability": "NEGLIGIBLE"
        },
        {
          "category": "HARM_CATEGORY_HATE_SPEECH",
          "probability": "NEGLIGIBLE"
        },
        {
          "category": "HARM_CATEGORY_HARASSMENT",
          "probability": "NEGLIGIBLE"
        },
        {
          "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
          "probability": "NEGLIGIBLE"
        }
      ]
    }
  ],
  "promptFeedback": {
    "safetyRatings": [
      {
        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        "probability": "NEGLIGIBLE"
      },
      {
        "category": "HARM_CATEGORY_HATE_SPEECH",
        "probability": "NEGLIGIBLE"
      },
      {
        "category": "HARM_CATEGORY_HARASSMENT",
        "probability": "NEGLIGIBLE"
      },
      {
        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
        "probability": "NEGLIGIBLE"
      }
    ]
  }
}

 */

const convertMessagesToGeminiMessage = (messages: Message[]): GeminiMessage[] => {
    return [];
}

export const chatCompletion: ChatCompletion = (apiKey: string, messages: Message[]): Promise<Message> => 
    axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
    "contents": convertMessagesToGeminiMessage(messages)
}, {
    headers: {
        'Content-Type': 'application/json'
    }
}).then((result) => {
    const response = result.data.candidates[0].content.parts[0].text;
    console.log(response);
    return response;
});
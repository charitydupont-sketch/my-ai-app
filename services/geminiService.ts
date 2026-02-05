
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSmartResponse = async (query: string, context: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a helpful AI assistant inside a phone simulation app. 
      Context: ${context}.
      User Query: ${query}.
      Keep the answer short, concise (under 20 words), and consistent with the requested persona.`,
    });
    return response.text || "I couldn't think of anything.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Connection error.";
  }
};

export const generateImage = async (prompt: string): Promise<string | null> => {
  try {
    // Switched to gemini-2.5-flash-image as imagen-3.0-generate-001 is deprecated/not found
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Professional fashion photography, product shot, ${prompt}, studio lighting, high quality, 4k, neutral background.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    return null;
  }
};

export const analyzeVoicemail = async (transcript: string): Promise<{ summary: string; notes: string; suggestions: string[] }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this voicemail transcript: "${transcript}". 
      Return a JSON object with:
      1. 'summary': A brief 1-sentence summary.
      2. 'notes': A short insight about the caller's emotional state or intent.
      3. 'suggestions': An array of 3 short, natural text message replies the user could send back.`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Voicemail Analysis Error:", error);
    return {
      summary: "Could not analyze voicemail.",
      notes: "Connection failed.",
      suggestions: ["Call back later", "Okay", "Can't talk now"]
    };
  }
};

export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: {
        parts: [{ text: text }],
      },
      config: {
        responseModalities: ["AUDIO"], // Updated to use Enum if available, or string literal as per guide examples
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    if (response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
      return response.candidates[0].content.parts[0].inlineData.data;
    }
    return null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

export const getWeather = async (location: string): Promise<any> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate realistic current weather data for ${location} based on the current season.
      Return ONLY valid JSON.
      Structure:
      {
        "location": "${location}",
        "temp": number (in fahrenheit),
        "condition": string (e.g. Sunny, Cloudy, Rain, Snow, Storm, Clear),
        "high": number,
        "low": number,
        "hourly": [
           { "time": "Now", "icon": "Sun" | "CloudSun" | "CloudRain" | "Moon" | "Cloud", "temp": number },
           ... (generate next 5 hours)
        ]
      }`,
      config: {
        responseMimeType: "application/json",
      },
    });

    return response.text ? JSON.parse(response.text) : null;
  } catch (error) {
    console.error("Weather Gen Error:", error);
    return null;
  }
};

export const getFashionAdvice = async (weatherContext: string, wardrobe: string[]): Promise<any[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a fashion stylist AI. 
      User Persona: Female, named Archie. Style is modern, chic, and functional.
      Weather Context: ${weatherContext}.
      User Wardrobe: ${JSON.stringify(wardrobe)}.
      
      Generate 3 distinct womenswear outfit recommendations in JSON format.
      1. One MUST reuse a specific item from the User Wardrobe that fits the weather. Label this type "WARDROBE".
      2. One should be a specific aesthetic/vibe (e.g. "Dark Academia" for rain, "Coquette" for sun, "Gorpcore" for cold) fitting the weather. Label this type "VIBE".
      3. One should be practical/comfortable. Label this type "PRACTICAL".

      Return JSON array structure:
      [
        {
          "type": "WARDROBE" | "VIBE" | "PRACTICAL",
          "title": "Short catchy title",
          "description": "2 sentence description of the look explaining why it fits the weather.",
          "item": "Name of the wardrobe item used (only if type is WARDROBE, else null)",
          "imagePrompt": "Detailed visual description of the outfit for image generation (e.g. 'A woman wearing [clothes], [weather-appropriate background]'). Ensure the subject is female and the background matches the weather context.",
          "tags": ["tag1", "tag2"]
        }
      ]`,
      config: {
        responseMimeType: "application/json",
      },
    });

    return response.text ? JSON.parse(response.text) : [];
  } catch (error) {
    console.error("Fashion Gen Error:", error);
    return [
      { type: "PRACTICAL", title: "Classic Layers", description: "You can't go wrong with layers in this weather.", item: null, imagePrompt: "Woman wearing layered clothing outfit flat lay", tags: ["Classic"] }
    ];
  }
};

export const generateReceipt = async (merchant: string, amount: string, category: string): Promise<{ name: string; price: string }[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a realistic itemized receipt for a transaction.
      Merchant: ${merchant}
      Total Amount: ${amount}
      Category: ${category}
      
      Requirements:
      - List 5-10 specific items relevant to the merchant and category.
      - If Merchant is a grocery store (e.g. Whole Foods, Trader Joe's) and amount is high, include items like "Leg of Lamb", "Ginger Ale", "Castile Soap", "Organic Eggs", etc.
      - The sum of item prices should roughly equal the total amount.
      - Return ONLY valid JSON in this format:
      {
        "items": [
          { "name": "Item Name", "price": "$12.99" }
        ]
      }`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const json = response.text ? JSON.parse(response.text) : { items: [] };
    return json.items || [];
  } catch (error) {
    console.error("Receipt Gen Error:", error);
    return [];
  }
};

import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateFarmingGuide(
  location: string,
  landSize: string,
  landUnit: string,
  soilType: string,
  waterAvailability: string,
  season: string,
  budget: string,
  farmingType: string
) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a complete farming plan for a beginner farmer.
    Location: ${location}
    Land Size: ${landSize} ${landUnit}
    Soil Type: ${soilType}
    Water Availability: ${waterAvailability}
    Farming Season: ${season}
    Budget Range: ${budget}
    Farming Type: ${farmingType}`,
    config: {
      systemInstruction: "You are an expert agricultural consultant. Provide a structured farming guide including: 1. Best crop suggestion, 2. Step-by-step farming plan, 3. 7-day action plan, 4. Common mistakes to avoid. Tailor the advice based on soil type, budget, and farming type.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          bestCrop: { type: Type.STRING },
          farmingPlan: { type: Type.STRING, description: "Detailed step-by-step plan" },
          sevenDayActionPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
          commonMistakes: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["bestCrop", "farmingPlan", "sevenDayActionPlan", "commonMistakes"]
      }
    }
  });
  return JSON.parse(response.text);
}

export async function generateIrrigationAdvice(crop: string, location: string, weatherData: any) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Provide irrigation advice for ${crop} in ${location}.
    Weather Data (for the target date): ${JSON.stringify(weatherData)}`,
    config: {
      systemInstruction: "You are an expert irrigation advisor. Based on the crop and the provided weather data (which could be current or forecast for tomorrow), provide advice on whether to irrigate on that specific date.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          shouldIrrigate: { type: Type.BOOLEAN },
          waterAmount: { type: Type.STRING, description: "Amount of water needed (e.g., 5 liters per plant)" },
          nextIrrigationTiming: { type: Type.STRING },
          riskAlerts: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["shouldIrrigate", "waterAmount", "nextIrrigationTiming", "riskAlerts"]
      }
    }
  });
  return JSON.parse(response.text);
}

export async function generateCropSuitability(location: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Suggest suitable crops for ${location}.`,
    config: {
      systemInstruction: "You are an agricultural scientist. Suggest the best crops for the given location based on climate and soil typical for that region.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            cropName: { type: Type.STRING },
            reasons: { type: Type.STRING },
            idealSeasons: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["cropName", "reasons", "idealSeasons"]
        }
      }
    }
  });
  return JSON.parse(response.text);
}

export async function diagnoseDisease(crop: string, symptoms: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Diagnose crop disease for ${crop} with symptoms: ${symptoms}`,
    config: {
      systemInstruction: "You are a plant pathologist. Identify the possible disease, causes, treatment, and prevention based on symptoms.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          possibleDisease: { type: Type.STRING },
          causes: { type: Type.STRING },
          treatment: { type: Type.STRING },
          prevention: { type: Type.STRING }
        },
        required: ["possibleDisease", "causes", "treatment", "prevention"]
      }
    }
  });
  return JSON.parse(response.text);
}

export async function generateCropHealthAdvice(crop: string, growthStage: string, farmingType: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Provide health booster advice for ${crop} at ${growthStage} stage using ${farmingType} farming.`,
    config: {
      systemInstruction: "You are a crop health expert. Provide advice on nutrients, fertilizers, and safe practices.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          nutrientNeeds: { type: Type.STRING },
          fertilizerSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          organicAlternatives: { type: Type.ARRAY, items: { type: Type.STRING } },
          safetyTips: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["nutrientNeeds", "fertilizerSuggestions", "organicAlternatives", "safetyTips"]
      }
    }
  });
  return JSON.parse(response.text);
}

export async function generateMarketAdvice(crop: string, location: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Provide market advice for ${crop} in ${location}.`,
    config: {
      systemInstruction: "You are a market analyst for agriculture. Provide trends and selling advice.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          marketTrend: { type: Type.STRING },
          sellNowOrWait: { type: Type.STRING, enum: ["Sell Now", "Wait"] },
          bestTiming: { type: Type.STRING },
          profitAdvice: { type: Type.STRING },
          priceHistory: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                month: { type: Type.STRING },
                price: { type: Type.NUMBER }
              },
              required: ["month", "price"]
            }
          }
        },
        required: ["marketTrend", "sellNowOrWait", "bestTiming", "profitAdvice", "priceHistory"]
      }
    }
  });
  return JSON.parse(response.text);
}

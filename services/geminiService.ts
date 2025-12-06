import { GoogleGenAI, Type } from "@google/genai";
import { WorldData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert File to Base64
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generateEntomancerWorld = async (imageFile: File, audioFile?: File, userPrompt?: string): Promise<WorldData> => {
  const modelId = "gemini-2.5-flash"; // Efficient for multimodal analysis

  const parts: any[] = [];
  
  // Add Image
  const imagePart = await fileToGenerativePart(imageFile);
  parts.push(imagePart);

  // Add Audio if present
  if (audioFile) {
    const audioPart = await fileToGenerativePart(audioFile);
    parts.push(audioPart);
  }

  const basePrompt = `
    Act as an "Entomancer"—a wizard biologist. Analyze this image (and optional audio) of an ecosystem.
    
    1. IDENTIFY: Detect insects, plants, and soil types. Infer hidden arthropods based on ecological niches (e.g., if there are aphids, assume ants or ladybugs; if loose soil, assume worms).
    2. FACTIONS: Group these into fantasy "Factions". Give them epic names (e.g., "The Iron Mandibles").
    3. MAP DATA: define territory polygons as coordinates (0-100 x/y percentages) for a map. Assign them to layers: Surface, Subterranean, or Canopy.
    4. LORE: Generate leader names, culture (50 words), and resources.
    5. STORY: Write a 3-chapter micro-story about a power struggle in this specific patch of land.
    6. CONFLICTS: List active conflicts for the news ticker.

    Strictly return JSON matching this schema.
    For colors, use hex codes suitable for a dark map (deep reds, greens, blues, golds).
  `;

  const finalPrompt = userPrompt ? `${basePrompt}\n\nUser Context/Description: ${userPrompt}` : basePrompt;
  
  parts.push({ text: finalPrompt });

  // Define Schema for structured JSON output
  const schema = {
    type: Type.OBJECT,
    properties: {
      factions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            species: { type: Type.STRING },
            factionName: { type: Type.STRING },
            leader: { type: Type.STRING },
            role: { type: Type.STRING, enum: ['predator', 'prey', 'decomposer', 'pollinator', 'producer'] },
            population: { type: Type.INTEGER },
            territory: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  x: { type: Type.NUMBER, description: "0-100 percentage" },
                  y: { type: Type.NUMBER, description: "0-100 percentage" }
                }
              }
            },
            layer: { type: Type.STRING, enum: ['Surface', 'Subterranean', 'Canopy'] },
            culture: { type: Type.STRING },
            resource: { type: Type.STRING },
            diplomaticStatus: { type: Type.STRING, enum: ['At War', 'Allied', 'Neutral', 'Dominated'] },
            color: { type: Type.STRING },
            enemies: { type: Type.ARRAY, items: { type: Type.STRING } },
            allies: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['id', 'species', 'factionName', 'leader', 'role', 'population', 'territory', 'layer', 'culture', 'resource', 'diplomaticStatus', 'color']
        }
      },
      story: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            illustrationType: { type: Type.STRING, enum: ['battle', 'diplomacy', 'discovery'] }
          },
          required: ['title', 'content', 'illustrationType']
        }
      },
      conflicts: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            description: { type: Type.STRING },
            severity: { type: Type.STRING, enum: ['low', 'medium', 'high'] }
          },
          required: ['id', 'description', 'severity']
        }
      }
    },
    required: ['factions', 'story', 'conflicts']
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: parts
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text");
    return JSON.parse(text) as WorldData;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
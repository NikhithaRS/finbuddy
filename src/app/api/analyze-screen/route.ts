import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextResponse } from 'next/server';

const MODEL_NAME = "gemini-1.5-flash"; 
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable.");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: MODEL_NAME,
});

// Map language codes to full names for the prompt
const languageMap: { [key: string]: string } = {
  'en-US': 'English',
  'hi-IN': 'Hindi',
  'kn-IN': 'Kannada',
  'ta-IN': 'Tamil',
  'te-IN': 'Telugu'
};

async function fileToGenerativePart(fileBuffer: Buffer, mimeType: string) {
  return {
    inlineData: {
      data: fileBuffer.toString("base64"),
      mimeType
    },
  };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const textPrompt = formData.get('prompt') as string;
    const imageFile = formData.get('image') as File | null;
    const requestedLangCode = formData.get('language') as string || 'en-US'; // Default to en-US

    // Validate lang code slightly
    const targetLanguageName = languageMap[requestedLangCode] || 'English';

    if (!textPrompt && !imageFile) {
      return NextResponse.json({ error: 'No prompt or image provided' }, { status: 400 });
    }

    const generationConfig = {
      temperature: 0.4, 
      topK: 32,
      topP: 1,
      maxOutputTokens: 8192, 
    };

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    // --- Construct the final prompt for the model --- 
    let finalPrompt = textPrompt;
    // Add language instruction ONLY if there's a text prompt 
    // (analyzing only an image doesn't need language instruction as much)
    if (textPrompt) {
      finalPrompt = `${textPrompt}\n\n(Please respond in ${targetLanguageName})`;
    }
    // Alternatively, you could add it as a separate turn or system message 
    // depending on what works best with the model.

    const parts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [];
    if (finalPrompt) {
      parts.push({ text: finalPrompt });
    }
    if (imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      parts.push(await fileToGenerativePart(buffer, imageFile.type));
    }

    // --- Call Gemini --- 
    const result = await model.generateContent({
      contents: [{ role: "user", parts }], // Send the potentially modified prompt
      generationConfig,
      safetySettings,
    });

    if (result.response) {
       const analysis = result.response.text();
      return NextResponse.json({ analysis });
    } else {
       console.error("Gemini API Error: No response data", result);
       const responseData: { promptFeedback?: { blockReason?: string } } = result.response as any;
       const blockReason = responseData?.promptFeedback?.blockReason;
       if (blockReason) {
          return NextResponse.json({ error: `Request blocked due to ${blockReason}` }, { status: 400 });
       }
       return NextResponse.json({ error: 'Failed to get analysis from Gemini API' }, { status: 500 });
    }

  } catch (error: unknown) {
    console.error("Error in analyze-screen API:", error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    // Handle specific error types if needed, e.g., JSON parsing errors
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
       return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Client will read GEMINI_API_KEY automatically from env
const ai = new GoogleGenAI({});

export async function POST(request: NextRequest) {
  try {
    const { message } = (await request.json()) as { message?: string };

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        "You are a helpful finance assistant for an app called Finbot. Answer briefly and clearly.",
        `User question: ${message}`,
      ],
    });

    return NextResponse.json({
      reply: response.text, // SDK gives a convenience .text property
    });
  } catch (error) {
    console.error("[GEMINI_API_ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong talking to Gemini." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

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

    const prompt = `
You are **Finbot**, an AI financial assistant inside a personal finance & stock analysis app.

### 🎯 Your Goals
1. Answer clearly, concisely, and accurately.
2. Speak in a friendly, professional Finbot tone.
3. Adjust explanations based on the user's knowledge.
4. Give practical and actionable insights, not generic filler.

### 📌 Style
- No emojis unless the user uses them first.
- Prefer short sentences and bullet points.
- Avoid generic “consult a financial advisor” disclaimers.
- Stay confident but not over-promising.

### 📊 Finance Logic
- For investing/saving questions, consider: time horizon, risk tolerance, volatility, emergency fund.
- When comparing options, explain pros, cons and who each suits.
- For stock questions, stay general: mention risk, diversification, long-term view.
- Don’t predict exact prices or guarantee returns.

### 🧠 Context
- Treat this message as part of an ongoing chat.
- If the user is asking follow-up questions, keep earlier context in mind.

User message:
"${message}"
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    return NextResponse.json({
      reply: response.text,
    });
  } catch (error) {
    console.error("[GEMINI_API_ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong talking to Gemini." },
      { status: 500 }
    );
  }
}

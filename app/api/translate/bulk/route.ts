import OpenAI from "openai";
import { NextResponse } from "next/server";
import { Translation } from "@/types/translate";

export async function POST(request: Request) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const TRANSLATION_PROMPT_TEMPLATE = `다음 한국어 단어를 영어와 아랍어로 번역해주세요.
각 줄마다 다음과 같은 형식으로 응답해주세요:

한국어: [한국어 단어]
영어: [영어 번역]
아랍어: [아랍어 번역]

예시:
한국어: 안녕하세요
영어: Hello
아랍어: مرحبا

한국어 단어: {ko}
{description}`;

  try {
    // 요청 본문에서 번역할 항목들 추출
    const { items }: { items: Translation[] } = await request.json();

    // 검수되지 않은 항목들만 필터링
    const unverifiedItems = items.filter((item) => !item.isVerified);

    // 각 항목에 대해 번역 수행
    const translatedItems = await Promise.all(
      unverifiedItems.map(async (item) => {
        const prompt = TRANSLATION_PROMPT_TEMPLATE.replace(
          "{ko}",
          item.koreanWord
        ).replace(
          "{description}",
          item.koreanDescription ? `설명: ${item.koreanDescription}` : ""
        );

        const messages = [
          {
            role: "system" as const,
            content:
              "당신은 전문 번역가입니다. 정확하고 자연스러운 번역을 제공해주세요.",
          },
          {
            role: "user" as const,
            content: prompt,
          },
        ];

        const completion = await client.chat.completions.create({
          model: "gpt-4",
          messages,
          temperature: 0.2,
        });

        const response = completion.choices[0].message.content || "";

        // 응답 파싱
        const englishMatch = response.match(/영어: (.+)/);
        const arabicMatch = response.match(/아랍어: (.+)/);

        return {
          ...item,
          englishTranslation: englishMatch ? englishMatch[1] : "",
          arabicTranslation: arabicMatch ? arabicMatch[1] : "",
        };
      })
    );

    return NextResponse.json({ success: true, data: translatedItems });
  } catch (error) {
    console.error("Bulk translation error:", error);
    return NextResponse.json(
      { success: false, error: "Translation failed" },
      { status: 500 }
    );
  }
}

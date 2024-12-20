import OpenAI from 'openai';
import { NextResponse } from 'next/server';

// OpenAI 클라이언트 초기화
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 번역 프롬프트 템플릿
const TRANSLATION_PROMPT_TEMPLATE = `다음 한국어 단어를 영어로 번역하고, 영문 키값과 아랍어 번역을 제공해주세요.
각 줄마다 다음과 같은 형식으로 응답해주세요:

한국어: [한국어 단어]
영어: [영어 번역]
영문 키값: [스네이크 케이스로 된 영문 키]
아랍어: [아랍어 번역]

예시:
한국어: 안녕하세요
영어: Hello
영문 키값: hello
아랍어: مرحبا

한국어 단어: {ko}
{description}`;

/**
 * 번역 API 엔드포인트
 * POST 요청을 처리하여 한국어 텍스트를 영어와 아랍어로 번역
 */
export async function POST(request: Request) {
	try {
		// 요청 본문에서 한국어 텍스트와 설명 추출
		const { ko, description } = await request.json();

		// 프롬프트 생성
		const prompt = TRANSLATION_PROMPT_TEMPLATE.replace('{ko}', ko).replace(
			'{description}',
			description ? `설명: ${description}` : ''
		);

		// OpenAI API 요청을 위한 메시지 구성
		const messages = [
			{
				role: 'system' as const,
				content:
					'당신은 전문 번역가입니다. 영문 키값은 스네이크 케이스로 작성하고, 특수문자나 공백 없이 영문 소문자만 사용해주세요.',
			},
			{
				role: 'user' as const,
				content: prompt,
			},
		];

		// OpenAI API 호출
		const completion = await client.chat.completions.create({
			model: 'gpt-4o-mini', // 사용할 GPT 모델
			messages: messages,
			temperature: 0.2, // 낮은 temperature로 일관된 번역 결과 유도
		});

		// OpenAI 응답 파싱
		const content = completion.choices[0].message.content || '';
		const lines = content.split('\n');

		// 번역 결과를 저장할 객체 초기화
		const translations = {
			ko: ko, // 원본 한국어 텍스트
			en: '', // 영어 번역
			englishKey: '', // 영문 키값
			ar: '', // 아랍어 번역
			description: description, // 설명 (있는 경우)
		};

		// 응답에서 각 번역 결과 추출
		lines.forEach((line) => {
			if (line.startsWith('영어:')) {
				translations.en = line.replace('영어:', '').trim();
			} else if (line.startsWith('영문 키값:')) {
				translations.englishKey = line.replace('영문 키값:', '').trim();
			} else if (line.startsWith('아랍어:')) {
				translations.ar = line.replace('아랍어:', '').trim();
			}
		});

		// 성공 응답 반환
		return NextResponse.json({
			success: true,
			data: translations,
		});
	} catch (error) {
		// 에러 로깅 및 에러 응답 반환
		console.error('OpenAI API Error:', error);
		return NextResponse.json(
			{ success: false, error: '번역 생성에 실패했습니다.' },
			{ status: 500 }
		);
	}
}

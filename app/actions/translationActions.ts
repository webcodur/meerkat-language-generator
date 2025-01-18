// 서버 사이드 액션임을 명시
"use server";

import { Octokit } from "@octokit/rest";
import { Translation } from "@/types/translate";

// 번역 입력 인터페이스
interface TranslationInput {
  ko: string; // 한국어 원문
  description?: string; // 번역 컨텍스트에 대한 설명 (선택사항)
}

// 번역 응답 인터페이스
interface TranslationResponse {
  koreanWord: string; // 한국어 키값
  en: string; // 영어 번역문
  ar: string; // 아랍어 번역문
}

// GitHub API 클라이언트 초기화
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN, // GitHub 인증 토큰
});

// Gist ID 환경변수
const GIST_ID = process.env.GIST_ID;

/**
 * 주어진 한국어 텍스트에 대한 번역을 생성합니다.
 * @param input 번역할 한국어 텍스트와 설명
 * @returns 생성된 영어 키, 영어 번역, 아랍어 번역
 */
export async function generateTranslations(
  input: TranslationInput
): Promise<TranslationResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/translate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );

  if (!response.ok) throw new Error("번역 요청 실패");
  const result = await response.json();
  if (!result.success) throw new Error(result.error);
  return result.data;
}

// 전체 번역 데이터 구조 인터페이스
interface TranslationData {
  ko: Record<string, string>; // 한국어 번역 데이터
  en: Record<string, string>; // 영어 번역 데이터
  ar: Record<string, string>; // 아랍어 번역 데이터
  descriptions: Record<string, string>; // 번역 설명 데이터
  isVerified?: Record<string, boolean>; // 번역 검증 상태
}

/**
 * GitHub Gist에서 저장된 번역 데이터를 불러옵니다.
 * @returns 모든 언어의 번역 데이터와 설명, 검증 상태
 */
export async function loadTranslations(): Promise<TranslationData> {
  try {
    // Gist에서 데이터 조회
    const response = await octokit.gists.get({
      gist_id: GIST_ID!,
    });

    if (!response.data.files) {
      throw new Error("Gist 파일을 찾을 수 없습니다.");
    }

    const files = response.data.files;

    // 각 언어별 JSON 파일 파싱
    return {
      ko: JSON.parse(files["ko.json"]?.content || "{}"),
      en: JSON.parse(files["en.json"]?.content || "{}"),
      ar: JSON.parse(files["ar.json"]?.content || "{}"),
      descriptions: JSON.parse(files["description.json"]?.content || "{}"),
      isVerified: JSON.parse(files["verification.json"]?.content || "{}"),
    };
  } catch (error) {
    console.error("Translation load error:", error);
    throw new Error("번역 데이터 로딩 실패");
  }
}

/**
 * 번역 데이터를 GitHub Gist에 저장합니다.
 * @param data 저장할 번역 데이터
 * @returns 성공 여부
 */
export async function saveTranslations(data: TranslationData) {
  try {
    // 검증 상태 데이터 생성
    const verificationData: Record<string, boolean> = {};
    Object.keys(data.ko).forEach((key) => {
      verificationData[key] = data.isVerified?.[key] || false;
    });

    // Gist 업데이트
    await octokit.gists.update({
      gist_id: GIST_ID!,
      files: {
        "ko.json": {
          content: JSON.stringify(data.ko, null, 2),
        },
        "en.json": {
          content: JSON.stringify(data.en, null, 2),
        },
        "ar.json": {
          content: JSON.stringify(data.ar, null, 2),
        },
        "description.json": {
          content: JSON.stringify(data.descriptions, null, 2),
        },
        "verification.json": {
          content: JSON.stringify(verificationData, null, 2),
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Translation save error:", error);
    throw new Error("번역 데이터 저장 실패");
  }
}

export async function bulkTranslate(items: Translation[]) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/translate/bulk`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items }),
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Translation failed");
    }
    return result.data;
  } catch (error) {
    console.error("Error in bulk translation:", error);
    throw error;
  }
}

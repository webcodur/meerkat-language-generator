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
  keys: Record<string, string>; // 키값 데이터
  ko: Record<string, string>; // 한국어 데이터
  en: Record<string, string>; // 영어 데이터
  ar: Record<string, string>; // 아랍어 데이터
  descriptions: Record<string, string>;
  isVerified?: Record<string, boolean>;
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
    console.log("files, files");

    // 각 언어별 JSON 파일 파싱
    return {
      keys: JSON.parse(files["keys.json"]?.content || "{}"),
      ko: JSON.parse(files["ko.json"]?.content || "{}"),
      en: JSON.parse(files["en.json"]?.content || "{}"),
      ar: JSON.parse(files["ar.json"]?.content || "{}"),
      descriptions: JSON.parse(files["description.json"]?.content || "{}"),
      isVerified: JSON.parse(files["verification.json"]?.content || "{}"),
    };
  } catch (error) {
    throw new Error("번역 데이터 로딩 실패");
  }
}

/**
 * 번역 데이터를 GitHub Gist에 저장합니다.
 * @param data 저장할 번역 데이터
 * @returns 성공 여부
 */
export async function saveTranslations(translations: Translation[]) {
  try {
    const data: TranslationData = translations.reduce(
      (acc, translation) => ({
        keys: { ...acc.keys, [translation.key]: translation.key },
        ko: { ...acc.ko, [translation.key]: translation.koreanWord },
        en: { ...acc.en, [translation.key]: translation.englishTranslation },
        ar: { ...acc.ar, [translation.key]: translation.arabicTranslation },
        descriptions: {
          ...acc.descriptions,
          [translation.key]: translation.koreanDescription,
        },
        isVerified: {
          ...acc.isVerified,
          [translation.key]: translation.isVerified,
        },
      }),
      { keys: {}, ko: {}, en: {}, ar: {}, descriptions: {}, isVerified: {} }
    );

    // 기존 저장 로직 사용
    return await saveToGist(data);
  } catch (error) {
    console.error("Translation save error:", error);
    throw new Error("번역 데이터 저장 실패");
  }
}

// 기존 함수 이름 변경
async function saveToGist(data: TranslationData) {
  try {
    const verificationData: Record<string, boolean> = {};
    // Translation 객체들의 key 필드를 기준으로 데이터 구성
    const translationData = Object.entries(data.keys).reduce(
      (acc, [key, _]) => {
        verificationData[key] = data.isVerified?.[key] || false;
        return {
          keys: { ...acc.keys, [key]: key },
          ko: { ...acc.ko, [key]: data.ko[key] || "" },
          en: { ...acc.en, [key]: data.en[key] || "" },
          ar: { ...acc.ar, [key]: data.ar[key] || "" },
          descriptions: {
            ...acc.descriptions,
            [key]: data.descriptions[key] || "",
          },
        };
      },
      { keys: {}, ko: {}, en: {}, ar: {}, descriptions: {} }
    );

    await octokit.gists.update({
      gist_id: GIST_ID!,
      files: {
        "keys.json": {
          content: JSON.stringify(translationData.keys, null, 2),
        },
        "ko.json": {
          content: JSON.stringify(translationData.ko, null, 2),
        },
        "en.json": {
          content: JSON.stringify(translationData.en, null, 2),
        },
        "ar.json": {
          content: JSON.stringify(translationData.ar, null, 2),
        },
        "description.json": {
          content: JSON.stringify(translationData.descriptions, null, 2),
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

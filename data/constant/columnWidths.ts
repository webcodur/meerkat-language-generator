// 기본 컬럼 너비 상수
export const BASE_WIDTHS = {
  CHECKBOX: 48,
  NUMBER: 48,
  KEY: 240,
  KOREAN: 200,
  DESCRIPTION: 200,
  BUTTON: 48,
  TRANSLATION: 280,
} as const;

// UI 관련 상수
export const UI_CONSTANTS = {
  COLUMN_GAP: 12, // gap-3 = 12px
  PADDING: 48, // p-6 = 24px * 2
} as const;

// 컬럼 너비 상수
export const COLUMN_WIDTHS = {
  checkbox: `${BASE_WIDTHS.CHECKBOX}px`,
  number: `${BASE_WIDTHS.NUMBER}px`,
  key: `${BASE_WIDTHS.KEY}px`,
  koreanWord: `${BASE_WIDTHS.KOREAN}px`,
  koreanDescription: `${BASE_WIDTHS.DESCRIPTION}px`,
  button: `${BASE_WIDTHS.BUTTON}px`,
  translation: `${BASE_WIDTHS.TRANSLATION}px`,
} as const;

// 컬럼 너비 배열
const COLUMN_WIDTH_VALUES = [
  BASE_WIDTHS.CHECKBOX,
  BASE_WIDTHS.NUMBER,
  BASE_WIDTHS.KEY,
  BASE_WIDTHS.KOREAN,
  BASE_WIDTHS.DESCRIPTION,
  BASE_WIDTHS.BUTTON,
  BASE_WIDTHS.TRANSLATION,
  BASE_WIDTHS.TRANSLATION,
  BASE_WIDTHS.BUTTON,
  BASE_WIDTHS.NUMBER,
];

// 컬럼 간격을 포함한 총 너비 + 패딩
export const TOTAL_WIDTH =
  COLUMN_WIDTH_VALUES.reduce((a, b) => a + b, 0) +
  UI_CONSTANTS.COLUMN_GAP * (COLUMN_WIDTH_VALUES.length - 1) +
  UI_CONSTANTS.PADDING;

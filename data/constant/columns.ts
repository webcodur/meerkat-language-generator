import { COLUMN_WIDTHS } from "./columnWidths";

export type ColumnType = keyof typeof COLUMN_WIDTHS;

export interface ColumnConfig {
  type: ColumnType;
  text: string;
  width: string;
}

export const COLUMNS: ColumnConfig[] = [
  { type: "checkbox", text: "선택", width: COLUMN_WIDTHS.checkbox },
  { type: "number", text: "번호", width: COLUMN_WIDTHS.number },
  {
    type: "koreanWord",
    text: "한국어 단어(키값) *",
    width: COLUMN_WIDTHS.koreanWord,
  },
  {
    type: "koreanDescription",
    text: "설명",
    width: COLUMN_WIDTHS.koreanDescription,
  },
  { type: "button", text: "생성", width: COLUMN_WIDTHS.button },
  { type: "translation", text: "영어", width: COLUMN_WIDTHS.translation },
  { type: "translation", text: "아랍어", width: COLUMN_WIDTHS.translation },
  { type: "button", text: "검수", width: COLUMN_WIDTHS.button },
  { type: "number", text: "제거", width: COLUMN_WIDTHS.number },
];

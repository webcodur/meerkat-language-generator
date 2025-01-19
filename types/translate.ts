export interface TranslationFormData {
  [key: string]: {
    title: string;
    description: string;
  };
}

export interface Translation {
  key: string;
  koreanWord: string;
  arabicTranslation: string;
  englishTranslation: string;
  isVerified: boolean;
  koreanDescription: string;
}

export interface TranslationData {
  keys: Record<string, string>;
  ko: Record<string, string>;
  en: Record<string, string>;
  ar: Record<string, string>;
  descriptions: Record<string, string>;
  isVerified?: Record<string, boolean>;
}

export interface SaveTranslationsParams {
  ko: Record<string, string>;
  en: Record<string, string>;
  ar: Record<string, string>;
  descriptions: Record<string, string>;
  isVerified: Record<string, boolean>;
}

export type PreviewMoveType = {
  fromIndex: number;
  toIndex: number;
  isDragging: boolean;
};

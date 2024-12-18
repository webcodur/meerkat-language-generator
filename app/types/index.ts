export interface Translation {
  koreanWord: string;
  koreanDescription?: string;
  englishTranslation?: string;
  arabicTranslation?: string;
  isVerified: boolean;
}

export interface TranslationFormData {
  koreanWord: string;
  koreanDescription: string;
} 
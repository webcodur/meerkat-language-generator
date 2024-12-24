export interface TranslationFormData {
	[key: string]: {
		title: string;
		description: string;
	};
}

export interface Translation {
	koreanWord: string;
	koreanDescription: string;
	englishKey: string;
	englishTranslation: string;
	arabicTranslation: string;
	isVerified: boolean;
}

export interface SaveTranslationsParams {
	ko: Record<string, string>;
	en: Record<string, string>;
	ar: Record<string, string>;
	descriptions: Record<string, string>;
	isVerified: Record<string, boolean>;
}

export interface PreviewMoveType {
	fromIndex: number;
	toIndex: number | null;
}

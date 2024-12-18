'use server';

import { Octokit } from '@octokit/rest';

interface TranslationInput {
	ko: string;
	description?: string;
}

interface TranslationResponse {
	englishKey: string;
	en: string;
	ar: string;
}

const octokit = new Octokit({
	auth: process.env.GITHUB_TOKEN,
});

const GIST_ID = process.env.GIST_ID;

export async function generateTranslations(
	input: TranslationInput
): Promise<TranslationResponse> {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/api/translate`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input),
		}
	);

	if (!response.ok) throw new Error('번역 요청 실패');
	const result = await response.json();
	if (!result.success) throw new Error(result.error);
	return result.data;
}

interface TranslationData {
	ko: Record<string, string>;
	en: Record<string, string>;
	ar: Record<string, string>;
	descriptions: Record<string, string>;
	isVerified?: Record<string, boolean>;
}

export async function loadTranslations(): Promise<TranslationData> {
	try {
		const response = await octokit.gists.get({
			gist_id: GIST_ID!,
		});

		const files = response.data.files;

		return {
			ko: JSON.parse(files['ko.json']?.content || '{}'),
			en: JSON.parse(files['en.json']?.content || '{}'),
			ar: JSON.parse(files['ar.json']?.content || '{}'),
			descriptions: JSON.parse(files['description.json']?.content || '{}'),
			isVerified: JSON.parse(files['verification.json']?.content || '{}'),
		};
	} catch (error) {
		console.error('Translation load error:', error);
		throw new Error('번역 데이터 로딩 실패');
	}
}

export async function saveTranslations(data: TranslationData) {
	try {
		const verificationData: Record<string, boolean> = {};
		Object.keys(data.ko).forEach((key) => {
			verificationData[key] = data.isVerified?.[key] || false;
		});

		await octokit.gists.update({
			gist_id: GIST_ID!,
			files: {
				'ko.json': {
					content: JSON.stringify(data.ko, null, 2),
				},
				'en.json': {
					content: JSON.stringify(data.en, null, 2),
				},
				'ar.json': {
					content: JSON.stringify(data.ar, null, 2),
				},
				'description.json': {
					content: JSON.stringify(data.descriptions, null, 2),
				},
				'verification.json': {
					content: JSON.stringify(verificationData, null, 2),
				},
			},
		});

		return { success: true };
	} catch (error) {
		console.error('Translation save error:', error);
		throw new Error('번역 데이터 저장 실패');
	}
}

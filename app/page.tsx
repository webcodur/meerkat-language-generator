import React from 'react';
import TranslationForm from './components/view/translation/TranslationForm';

export default function Home() {
	return (
		<main className="container px-4 py-8 mx-auto">
			<h1
				className="mb-8 text-3xl font-bold text-center"
				style={{ fontFamily: 'Pretendard-Regular' }}
			>
				언어팩 생성기
			</h1>
			<TranslationForm />
		</main>
	);
}

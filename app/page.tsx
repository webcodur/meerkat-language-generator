'use client';

import React from 'react';
import TranslationForm from './components/view/translation/TranslationForm';

export default function Home() {
	return (
		<main className="container px-4 py-8 mx-auto">
			<h1
				className="mb-8 text-3xl font-bold text-center"
				style={{
					fontFamily: 'Pretendard-Regular',
					textShadow: '2px 2px 4px #aaa',
					color: '#444',
				}}
			>
				언어팩 생성기
			</h1>
			<TranslationForm />
			<style jsx>{`
				@keyframes backgroundAnimation {
					0% {
						background-position: 0% 50%;
					}
					100% {
						background-position: 100% 50%;
					}
				}
			`}</style>
		</main>
	);
}

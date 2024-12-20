import React from 'react';
import TranslationForm from './components/view/translation/TranslationForm';

export default function Home() {
	return (
		<main className="container px-4 py-8 mx-auto">
			<h1 className="mb-8 text-3xl font-bold text-center">
				세븐 미어캣 language generator
			</h1>
			<TranslationForm />
		</main>
	);
}

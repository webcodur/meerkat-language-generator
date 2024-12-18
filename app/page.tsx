import React from 'react';
import TranslationForm from './components/TranslationForm';

export default function Home() {
  return (
    <main className="container px-4 py-8 mx-auto">
      <h1 className="mb-8 text-3xl font-bold text-center">
        자동 다국어 번역 처리기
      </h1>
      <TranslationForm />
    </main>
  );
} 
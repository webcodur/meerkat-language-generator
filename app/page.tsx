"use client";

import React from "react";
import TranslationForm from "./components/view/translation/TranslationForm";

export default function Home() {
  return (
    <main className="flex flex-col w-full flex-1">
      <h1
        className="py-8 text-3xl font-bold text-center"
        style={{
          fontFamily: "Pretendard-Regular",
          textShadow: "2px 2px 4px #aaa",
          color: "#444",
        }}
      >
        언어팩 생성기
      </h1>
      <TranslationForm />
    </main>
  );
}

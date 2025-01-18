// JSON 파일 다운로드 핸들러
const handleDownload = (rows, type: "ko" | "en" | "ar") => {
  const translations: Record<string, string> = {};

  // 선택된 언어의 번역 데이터만 추출
  rows.forEach((row) => {
    if (row.englishKey) {
      switch (type) {
        case "ko":
          translations[row.englishKey] = row.koreanWord;
          break;
        case "en":
          translations[row.englishKey] = row.englishTranslation;
          break;
        case "ar":
          translations[row.englishKey] = row.arabicTranslation;
          break;
      }
    }
  });

  // JSON 파일 생성 및 다운로드
  const blob = new Blob([JSON.stringify(translations, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${type}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default handleDownload;

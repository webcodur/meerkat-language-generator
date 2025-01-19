import { useState, useEffect } from "react";
import { Translation } from "@/types/translate";
import {
  generateTranslations,
  loadTranslations,
  saveTranslations,
} from "@/app/actions/translationActions";

const processTranslationData = (translationData: any): Translation[] => {
  const existingRows: Translation[] = [];

  // keys를 기준으로 Translation 객체 생성하도록 수정
  Object.keys(translationData.keys).forEach((key) => {
    existingRows.push({
      key: key, // 실제 키값 사용
      koreanWord: translationData.ko[key] || "",
      koreanDescription: translationData.descriptions[key] || "",
      englishTranslation: translationData.en[key] || "",
      arabicTranslation: translationData.ar[key] || "",
      isVerified: translationData.isVerified?.[key] || false,
    });
  });

  return existingRows;
};

export default function useTranslations() {
  const [rows, setRows] = useState<Translation[]>([
    {
      key: `key_${new Date().getTime()}`, // 유니크한 키 생성
      koreanWord: "",
      koreanDescription: "",
      englishTranslation: "",
      arabicTranslation: "",
      isVerified: false,
    },
  ]);

  const [loadingRows, setLoadingRows] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTranslationData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const translationData = await loadTranslations();
      console.log("translationData", translationData);
      const existingRows = processTranslationData(translationData);

      if (existingRows.length === 0) {
        existingRows.push({
          key: `key_${new Date().getTime()}`, // 유니크한 키 생성
          koreanWord: "",
          koreanDescription: "",
          englishTranslation: "",
          arabicTranslation: "",
          isVerified: false,
        });
      }

      setRows(existingRows);
    } catch (error) {
      console.error("번역 데이터 로드 중 오류 발생:");
      setError("번역 데이터를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (index: number) => {
    const koreanWord = rows[index].koreanWord;
    const koreanDescription = rows[index].koreanDescription;

    setLoadingRows((prev) => ({ ...prev, [index]: true }));

    try {
      const response = await generateTranslations({
        ko: koreanWord,
        description: koreanDescription || undefined,
      });

      const newRows = [...rows];
      newRows[index] = {
        ...newRows[index],
        englishTranslation: response.en,
        arabicTranslation: response.ar,
      };
      setRows(newRows);
    } catch (error) {
      console.error("번역 생성 중 오류 발생:", error);
      alert("번역 생성 중 오류가 발생했습니다.");
    } finally {
      setLoadingRows((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleSave = async () => {
    try {
      await saveTranslations(rows);
      alert("저장되었습니다.");
    } catch (error) {
      console.error("저장 중 오류 발생:", error);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  const handleDuplicate = () => {
    const emptyRow: Translation = {
      key: `key_${new Date().getTime()}`, // 유니크한 키 생성
      koreanWord: "",
      koreanDescription: "",
      englishTranslation: "",
      arabicTranslation: "",
      isVerified: false,
    };
    setRows([...rows, emptyRow]);
  };

  const handleDelete = (index: number) => {
    if (rows[index].isVerified) {
      alert("검수된 행은 삭제할 수 없습니다.");
      return;
    }

    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== index));
    }
  };

  useEffect(() => {
    loadTranslationData();
  }, []);

  return {
    rows,
    setRows,
    loadingRows,
    isLoading,
    error,
    loadTranslationData,
    handleSubmit,
    handleSave,
    handleDuplicate,
    handleDelete,
  };
}

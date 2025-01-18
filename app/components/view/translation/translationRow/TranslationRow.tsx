import React from "react";
import { Translation } from "@/types/translate";
import { COLUMN_WIDTHS } from "@/data/constant/columnWidths";
import TranslationInput from "./TranslationInput";
import VerificationCheckbox from "./VerificationCheckbox";
import { commonInputStyle } from "./styles";
import CheckboxCell from "./cells/CheckboxCell";
import RowNumberCell from "./cells/RowNumberCell";
import KoreanInputCell from "./cells/KoreanInputCell";
import GenerateButton from "./cells/GenerateButton";
import DeleteButton from "./DeleteButton";

interface TranslationRowProps {
  row: Translation;
  index: number;
  loadingRows: { [key: number]: boolean };
  onUpdate: (index: number, updatedRow: Translation) => void;
  onSubmit: (index: number) => void;
  onDelete: (index: number) => void;
  selectedRows: number[];
  onRowSelect: (index: number, selected: boolean) => void;
  disableDelete: boolean;
}

/**
 * 번역 행 컴포넌트 구조:
 * 1. [체크박스] - 행 선택
 * 2. [번호] - 행 번호
 * 3. [한국어 단어] - 원본 단어 입력
 * 4. [한국어 설명] - 원본 설명 입력
 * 5. [생성 버튼] - 번역 생성
 * 6. [영어 키] - 번역 키 입력
 * 7. [영어 번역] - 영어 번역 입력
 * 8. [아랍어 번역] - 아랍어 번역 입력
 * 9. [검증 체크박스] - 번역 검증 상태
 * 10. [삭제 버튼] - 행 삭제
 */
export default function TranslationRow({
  row,
  index,
  loadingRows,
  onUpdate,
  onSubmit,
  onDelete,
  selectedRows,
  onRowSelect,
  disableDelete,
}: TranslationRowProps) {
  return (
    <div
      data-row-id={index}
      className="flex items-center space-x-2 py-2 border-b min-h-[42px]"
    >
      {/* 1. 체크박스 */}
      <CheckboxCell
        index={index}
        selectedRows={selectedRows}
        onRowSelect={onRowSelect}
      />

      {/* 2. 행 번호 */}
      <RowNumberCell index={index} />

      {/* 3. 한국어 단어 입력 */}
      <KoreanInputCell
        row={row}
        index={index}
        onUpdate={onUpdate}
        type="word"
      />

      {/* 4. 한국어 설명 입력 */}
      <KoreanInputCell
        row={row}
        index={index}
        onUpdate={onUpdate}
        type="description"
      />

      {/* 5. 번역 생성 버튼 */}
      <GenerateButton
        row={row}
        index={index}
        loadingRows={loadingRows}
        onSubmit={onSubmit}
      />

      {/* 6. 영어 키 입력 */}
      <input
        type="text"
        value={row.englishKey}
        onChange={(e) =>
          onUpdate(index, { ...row, englishKey: e.target.value })
        }
        disabled={row.isVerified}
        className={`${commonInputStyle} ${
          row.isVerified ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
        style={{
          width: COLUMN_WIDTHS.englishKey,
          minWidth: COLUMN_WIDTHS.englishKey,
          maxWidth: COLUMN_WIDTHS.englishKey,
        }}
      />

      {/* 7. 영어 번역 입력 */}
      <TranslationInput
        value={row.englishTranslation}
        onChange={(value) =>
          onUpdate(index, { ...row, englishTranslation: value })
        }
        disabled={row.isVerified}
        language="en-US"
        width={parseInt(COLUMN_WIDTHS.translation)}
      />

      {/* 8. 아랍어 번역 입력 */}
      <TranslationInput
        value={row.arabicTranslation}
        onChange={(value) =>
          onUpdate(index, { ...row, arabicTranslation: value })
        }
        disabled={row.isVerified}
        language="ar-SA"
        width={parseInt(COLUMN_WIDTHS.translation)}
        isRTL={true}
      />

      {/* 9. 검증 체크박스 */}
      <VerificationCheckbox
        checked={row.isVerified}
        onChange={(checked) => onUpdate(index, { ...row, isVerified: checked })}
        width={parseInt(COLUMN_WIDTHS.button)}
      />

      {/* 10. 삭제 버튼 */}
      <DeleteButton
        onClick={() => onDelete(index)}
        disabled={row.isVerified || disableDelete}
        width={parseInt(COLUMN_WIDTHS.number)}
      />
    </div>
  );
}

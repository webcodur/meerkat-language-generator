import React from "react";
import { Translation } from "@/types/translate";
import { COLUMNS } from "@/data/constant/columns";
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
 * 3. [한국어 단어] - 원본 단어 입력 (키값으로 사용)
 * 4. [한국어 설명] - 원본 설명 입력
 * 5. [생성 버튼] - 번역 생성
 * 6. [영어 번역] - 영어 번역 입력
 * 7. [아랍어 번역] - 아랍어 번역 입력
 * 8. [검증 체크박스] - 번역 검증 상태
 * 9. [삭제 버튼] - 행 삭제
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
      className="flex items-center gap-3 py-3 border-b hover:bg-gray-50 transition-colors min-h-[48px]"
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

      {/* 6. 영어 번역 입력 */}
      <TranslationInput
        value={row.englishTranslation}
        onChange={(value) =>
          onUpdate(index, { ...row, englishTranslation: value })
        }
        disabled={row.isVerified}
        language="en-US"
        width={parseInt(COLUMNS[5].width)}
      />

      {/* 7. 아랍어 번역 입력 */}
      <TranslationInput
        value={row.arabicTranslation}
        onChange={(value) =>
          onUpdate(index, { ...row, arabicTranslation: value })
        }
        disabled={row.isVerified}
        language="ar-SA"
        width={parseInt(COLUMNS[6].width)}
        isRTL={true}
      />

      {/* 8. 검증 체크박스 */}
      <VerificationCheckbox
        checked={row.isVerified}
        onChange={(checked) => onUpdate(index, { ...row, isVerified: checked })}
        width={parseInt(COLUMNS[7].width)}
      />

      {/* 9. 삭제 버튼 */}
      <DeleteButton
        onClick={() => onDelete(index)}
        disabled={row.isVerified || disableDelete}
        width={parseInt(COLUMNS[8].width)}
      />
    </div>
  );
}

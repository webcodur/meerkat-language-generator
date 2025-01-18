"use client";
import { Translation } from "@/types/translate";
import type { PreviewMoveType } from "@/hooks/useRowSelection";

import LockButton from "./lockButton/LockButton";
import PasswordModal from "./passwordModal/PasswordModal";
import TableHeader from "./tableHeader/TableHeader";
import BottomActions from "./bottomActions/BottomActions";
import TranslationRow from "./translationRow/TranslationRow";
import DragHandle from "./dragHandle/DragHandle";
import LoadingState from "@/app/components/ui/LoadingState";
import ErrorState from "@/app/components/ui/ErrorState";
import useTranslations from "@/hooks/useTranslations";
import useRowSelection from "@/hooks/useRowSelection";
import usePasswordLock from "@/hooks/usePasswordLock";

const getRowStyle = (
  index: number,
  selectedRows: number[],
  previewMove: PreviewMoveType | null
) => {
  const isSelected = selectedRows.includes(index);
  const style: React.CSSProperties = {};

  if (isSelected) {
    style.backgroundColor = "rgba(59, 130, 246, 0.1)";
  }

  if (previewMove) {
    if (selectedRows.includes(index)) {
      style.opacity = "0.5";
    }

    if (previewMove.toIndex === index) {
      style.borderTop = "2px solid #3b82f6";
    }
  }

  return style;
};

export default function TranslationForm() {
  const {
    rows,
    setRows,
    loadingRows,
    isLoading,
    error,
    loadTranslationData,
    handleSubmit,
    handleDuplicate,
    handleDelete,
  } = useTranslations();

  const {
    selectedRows,
    setSelectedRows,
    previewMove,
    setPreviewMove,
    handleMoveRows,
  } = useRowSelection(rows, setRows);

  const {
    showModal,
    setShowModal,
    isLocked,
    password,
    passwordError,
    handlePasswordSubmit,
    handlePasswordChange,
    handleModalClose,
  } = usePasswordLock();

  // 행 업데이트 핸들러
  const handleRowUpdate = (index: number, updatedRow: Translation) => {
    const newRows = [...rows];
    newRows[index] = updatedRow;
    setRows(newRows);
  };

  // 행 선택 핸들러
  const handleRowSelect = (index: number, selected: boolean) => {
    setSelectedRows((prev) => {
      if (selected) {
        // 이미 선택된 행이 있는 경우
        if (prev.length > 0) {
          const minSelected = Math.min(...prev);
          const maxSelected = Math.max(...prev);

          // 현재 선택하려는 행이 기존 선택 범위에 인접해있는지 확인
          if (index === minSelected - 1 || index === maxSelected + 1) {
            return [...prev, index].sort((a, b) => a - b);
          }
          // 범위를 벗어난 선택인 경우 새로운 선택으로 시작
          return [index];
        }
        // 첫 선택인 경우
        return [index];
      } else {
        // 선택 해제 시 해당 인덱스가 범위의 끝에 있는 경우에만 허용
        const minSelected = Math.min(...prev);
        const maxSelected = Math.max(...prev);
        if (index === minSelected || index === maxSelected) {
          return prev.filter((i) => i !== index);
        }
        return prev;
      }
    });
  };

  // 이동 미리보기 핸들러
  const handlePreviewMove = (fromIndex: number, toIndex: number | null) => {
    setPreviewMove(toIndex === null ? null : { fromIndex, toIndex });
  };

  // 로딩 중이거나 에러 상태일 때의 렌더링
  // if (true) return <LoadingState />;
  if (isLoading) return <LoadingState />;
  if (error)
    return <ErrorState error={error} onRefresh={loadTranslationData} />;

  // 메인 폼 렌더링
  const translatedCount = rows.filter(
    (row) => row.englishTranslation && row.arabicTranslation
  ).length;
  const totalRows = rows.length;
  const untranslatedCount = totalRows - translatedCount;
  const completionRate =
    totalRows > 0 ? (translatedCount / totalRows) * 100 : 0;

  return (
    <div className="flex justify-center w-full min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-[1400px]">
        <div className="relative p-6 pb-32 overflow-hidden bg-white border rounded-lg shadow-sm">
          {/* 테이블 헤더 */}
          <TableHeader />

          <div className="relative overflow-visible">
            <div className="relative min-w-max">
              {/* 행 이동 미리보기 */}
              {selectedRows.length > 0 && (
                <DragHandle
                  selectedRows={selectedRows}
                  totalRows={rows.length}
                  onMoveRows={handleMoveRows}
                  onPreviewMove={handlePreviewMove}
                  rows={rows}
                />
              )}

              {/* 행 렌더링 */}
              {rows.map((row, index) => (
                <div
                  key={index}
                  data-row-id={index}
                  style={getRowStyle(index, selectedRows, previewMove)}
                >
                  <TranslationRow
                    row={row}
                    index={index}
                    loadingRows={loadingRows}
                    onUpdate={handleRowUpdate}
                    onSubmit={handleSubmit}
                    onDelete={handleDelete}
                    selectedRows={selectedRows}
                    onRowSelect={handleRowSelect}
                    disableDelete={selectedRows.length > 0}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 하단 액션 버튼 */}
          <BottomActions
            onDuplicate={() => {
              const timestamp = new Date().getTime();
              const newRow: Translation = {
                koreanWord: `임시_${timestamp}`,
                arabicTranslation: "",
                englishTranslation: "",
                isVerified: false,
                koreanDescription: "",
              };
              setRows([...rows, newRow]);
            }}
            isLocked={isLocked}
            disableActions={selectedRows.length > 0}
            rows={rows}
            onClearSelection={() => setSelectedRows([])}
            onUpdateRows={setRows}
          />

          {/* 비밀번호 버튼 */}
          <LockButton
            isLocked={isLocked}
            onShowModal={() => setShowModal(true)}
          />
          {/* 비밀번호 모달 */}
          {showModal && (
            <PasswordModal
              password={password}
              passwordError={passwordError}
              onPasswordChange={handlePasswordChange}
              onSubmit={handlePasswordSubmit}
              onClose={handleModalClose}
            />
          )}
        </div>

        {/* 통계 */}
        <div className="fixed bottom-0 left-0 right-0 m-6">
          <div className="mx-auto max-w-[1400px]">
            <div className="p-4 bg-white border rounded-lg shadow-sm">
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between w-full">
                  <p className="text-lg">번역 완료 비율:</p>
                  <p className="text-lg">{completionRate.toFixed(2)}%</p>
                </div>
                <div className="flex justify-between w-full">
                  <p className="text-lg">미번역 항목 수:</p>
                  <p className="text-lg">{untranslatedCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

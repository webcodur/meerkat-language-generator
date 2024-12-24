'use client';
import { Translation } from '@/types/translate';
import type { PreviewMoveType } from '@/hooks/useRowSelection';

import ModelInfo from './modelInfo/ModelInfo';
import LockButton from './lockButton/LockButton';
import PasswordModal from './passwordModal/PasswordModal';
import TableHeader from './tableHeader/TableHeader';
import BottomActions from './bottomActions/BottomActions';
import TranslationRow from './translationRow/TranslationRow';
import DragHandle from './dragHandle/DragHandle';
import LoadingState from '@/app/components/ui/LoadingState';
import ErrorState from '@/app/components/ui/ErrorState';
import useTranslations from '@/hooks/useTranslations';
import useRowSelection from '@/hooks/useRowSelection';
import usePasswordLock from '@/hooks/usePasswordLock';

const getRowStyle = (
	index: number,
	selectedRows: number[],
	previewMove: PreviewMoveType | null
) => {
	const isSelected = selectedRows.includes(index);
	const style: React.CSSProperties = {};

	if (isSelected) {
		style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
	}

	if (previewMove) {
		if (selectedRows.includes(index)) {
			style.opacity = '0.5';
		}

		if (previewMove.toIndex === index) {
			style.borderTop = '2px solid #3b82f6';
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

	const { selectedRows, setSelectedRows, previewMove, setPreviewMove, handleMoveRows } =
		useRowSelection(rows, setRows);

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
	if (isLoading) return <LoadingState />;
	if (error) return <ErrorState error={error} onRefresh={loadTranslationData} />;

	// 메인 폼 렌더링
	return (
		<div className="flex w-full">
			<div className="relative p-6 pb-32 border rounded-lg">
				<ModelInfo model={'gpt-4o-mini'} />
				<TableHeader />
				<div className="relative">
					{selectedRows.length > 0 && (
						<DragHandle
							selectedRows={selectedRows}
							totalRows={rows.length}
							onMoveRows={handleMoveRows}
							onPreviewMove={handlePreviewMove}
							rows={rows}
						/>
					)}

					{rows.map((row, index) => (
						<div key={index} style={getRowStyle(index, selectedRows, previewMove)}>
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

				<BottomActions
					onDuplicate={handleDuplicate}
					isLocked={isLocked}
					disableActions={selectedRows.length > 0}
					rows={rows}
					onClearSelection={() => setSelectedRows([])}
				/>

				<LockButton isLocked={isLocked} onShowModal={() => setShowModal(true)} />
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
		</div>
	);
}

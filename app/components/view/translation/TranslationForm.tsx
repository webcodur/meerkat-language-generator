'use client';
import { Translation } from '@/app/types/translate';

import ModelInfo from './ModelInfo';
import LockButton from './LockButton';
import PasswordModal from './PasswordModal';
import TableHeader from './TableHeader';
import BottomActions from './BottomActions';
import TranslationRow from './TranslationRow';
import DragHandle from './DragHandle';
import LoadingState from '@/app/components/ui/LoadingState';
import ErrorState from '@/app/components/ui/ErrorState';
import useTranslationForm from '@/app/hooks/useTranslationForm';
import usePasswordLock from '@/app/hooks/usePasswordLock';

export default function TranslationForm() {
	// 커스텀 훅을 통한 상태 및 기능 관리
	const {
		rows, // 번역 행 데이터
		setRows, // 행 데이터 업데이트 함수
		selectedRows, // 선택된 행 인덱스 배열
		setSelectedRows, // 선택된 행 업데이트 함수
		loadingRows, // 로딩 중인 행 표시
		previewMove, // 이동 미리보기 상태
		setPreviewMove, // 미리보기 상태 업데이트
		isLoading, // 전체 로딩 상태
		error, // 에러 상태
		loadTranslationData, // 번역 데이터 로드 함수
		handleSubmit, // 제출 핸들러
		handleDuplicate, // 복제 핸들러
		handleDelete, // 삭제 핸들러
		getRowStyle, // 행 스타일 계산 함수
	} = useTranslationForm();

	// 비밀번호 잠금 관련 상태 및 기능
	const {
		showModal, // 모달 표시 여부
		setShowModal, // 모달 표시 상태 업데이트
		isLocked, // 잠금 상태
		password, // 비밀번호
		passwordError, // 비밀번호 에러
		handlePasswordSubmit, // 비밀번호 제출 핸들러
		handlePasswordChange, // 비밀번호 변경 핸들러
		handleModalClose, // 모달 닫기 핸들러
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
				return [...prev, index].sort((a, b) => a - b);
			} else {
				return prev.filter((i) => i !== index);
			}
		});
	};

	// 행 이동 핸들러
	const handleMoveRows = () => {
		if (!previewMove || previewMove.toIndex === null) return;

		// 선택된 행들을 새 위치로 이동
		const newRows = [...rows];
		const selectedRowsData = selectedRows.map((index) => newRows[index]);
		const remainingRows = newRows.filter((_, index) => !selectedRows.includes(index));

		remainingRows.splice(previewMove.toIndex, 0, ...selectedRowsData);

		// 선택된 행들의 새 인덱스 계산
		const newSelectedRows = Array.from(
			{ length: selectedRows.length },
			(_, i) => previewMove.toIndex + i
		);

		setRows(remainingRows);
		setSelectedRows(newSelectedRows);
		setPreviewMove(null);
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
		<div className="mx-auto max-w-7xl">
			<div className="relative p-6 pb-20 border rounded-lg">
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
						<div key={index} style={getRowStyle(index)}>
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

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

	// 행 이동 핸들러
	const handleMoveRows = () => {
		if (!previewMove || previewMove.toIndex === null) return;

		// 현재 선택된 행들의 인덱스 범위 확인
		const minSelectedIndex = Math.min(...selectedRows);
		const maxSelectedIndex = Math.max(...selectedRows);
		const targetIndex = previewMove.toIndex;

		// 이동이 필요없는 경우 (이미 맨 위에 있고 위로 이동하려 할 때)
		if (minSelectedIndex === 0 && targetIndex === 0) {
			setPreviewMove(null);
			return;
		}

		// 이동이 필요없는 경우 (이미 맨 아래에 있고 아래로 이동하려 할 때)
		if (maxSelectedIndex === rows.length - 1 && targetIndex === rows.length - 1) {
			setPreviewMove(null);
			return;
		}

		// 선택된 행들을 새 위치로 이동
		const newRows = [...rows];
		const selectedRowsData = selectedRows.map((index) => newRows[index]);
		const remainingRows = newRows.filter((_, index) => !selectedRows.includes(index));

		// 새로운 위치에 선택된 행들 삽입
		remainingRows.splice(targetIndex, 0, ...selectedRowsData);

		// 선택된 행들의 새 인덱스 계산
		const newSelectedRows = Array.from(
			{ length: selectedRows.length },
			(_, i) => targetIndex + i
		);

		// 상태 업데이트
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

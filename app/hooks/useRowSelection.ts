import { useState, useEffect } from 'react';
import { Translation } from '@/app/types/translate';

/**
 * 행 이동을 미리보기 하기 위한 인터페이스
 * @property fromIndex - 이동할 행의 현재 위치
 * @property toIndex - 이동할 행의 목표 위치 (null일 경우 이동 대상 없음)
 */
interface PreviewMoveType {
	fromIndex: number;
	toIndex: number | null;
}

/**
 * 행 선택과 이동을 관리하는 커스텀 훅
 * @param rows - 번역 데이터 배열
 * @param setRows - 번역 데이터를 업데이트하는 함수
 * @returns 행 선택과 이동에 필요한 상태와 함수들을 반환
 */
export default function useRowSelection(
	rows: Translation[],
	setRows: (rows: Translation[]) => void
) {
	// 선택된 행들의 인덱스를 저장하는 상태
	const [selectedRows, setSelectedRows] = useState<number[]>([]);
	// 행 이동 미리보기 상태를 저장
	const [previewMove, setPreviewMove] = useState<PreviewMoveType | null>(null);

	/**
	 * 선택된 행이 없을 때 미리보기 상태를 초기화
	 */
	useEffect(() => {
		if (selectedRows.length === 0) {
			setPreviewMove(null);
		}
	}, [selectedRows]);

	/**
	 * 선택된 행들을 새로운 위치로 이동시키는 함수
	 * 1. 선택된 행들의 데이터를 추출
	 * 2. 선택되지 않은 행들만 필터링
	 * 3. 새로운 위치에 선택된 행들을 삽입
	 * 4. 선택된 행들의 새로운 인덱스를 계산하여 업데이트
	 */
	const handleMoveRows = () => {
		if (!previewMove || previewMove.toIndex === null) return;

		const newRows = [...rows];
		const selectedRowsData = selectedRows.map((index) => newRows[index]);
		const minSelectedIndex = Math.min(...selectedRows);
		const maxSelectedIndex = Math.max(...selectedRows);
		const targetIndex = previewMove.toIndex;

		// 선택된 행들을 제거
		const remainingRows = newRows.filter((_, index) => !selectedRows.includes(index));

		// 목표 인덱스 조정
		let adjustedTargetIndex = targetIndex;
		if (targetIndex > maxSelectedIndex) {
			adjustedTargetIndex -= selectedRows.length;
		}

		// 새 위치에 선택된 행들 삽입
		remainingRows.splice(adjustedTargetIndex, 0, ...selectedRowsData);

		// 새로운 선택된 행들의 인덱스 계산
		const newSelectedRows = Array.from(
			{ length: selectedRows.length },
			(_, i) => adjustedTargetIndex + i
		);

		setRows(remainingRows);
		setSelectedRows(newSelectedRows);
		setPreviewMove(null);
	};

	return {
		selectedRows, // 현재 선택된 행들의 인덱스 배열
		setSelectedRows, // 행 선택 상태를 업데이트하는 함수
		previewMove, // 현재 이동 미리보기 상태
		setPreviewMove, // 이동 미리보기 상태를 업데이트하는 함수
		handleMoveRows, // 실제 행 이동을 실행하는 함수
	};
}

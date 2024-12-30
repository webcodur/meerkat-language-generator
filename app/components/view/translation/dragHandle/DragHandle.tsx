import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RangeSliderBar } from './RangeSliderBar';
import { DragHandleButton } from './DragHandleButton';
import { HANDLE_VERTICAL_OFFSET } from '@/data/constant/dragHandle';
import { DragHandleProps, DragState, Measurements, RowBoundary } from '@/types/dragHandle';

/**
 * DragHandle 컴포넌트
 * 선택된 행들을 드래그 앤 드롭으로 이동할 수 있게 해주는 UI 컴포넌트
 * @param selectedRows - 현재 선택된 행들의 인덱스 배열
 * @param totalRows - 전체 행의 개수
 * @param onMoveRows - 행 이동이 완료될 때 호출되는 콜백
 * @param onPreviewMove - 드래그 중 미리보기 업데이트 시 호출되는 콜백
 * @param rows - 전체 행 데이터
 */
export default function DragHandle({
	selectedRows,
	totalRows,
	onMoveRows,
	onPreviewMove,
	rows,
}: DragHandleProps) {
	// 드래그 상태 관리 (드래그 여부, 시작 위치, 드래그 오프셋)
	const [dragState, setDragState] = useState<DragState>({
		isDragging: false,
		startY: 0,
		dragOffset: 0,
	});

	// 컴포넌트의 측정값 관리 (전체 높이, 범위 높이, 핸들 위치, 행 위치들)
	const [measurements, setMeasurements] = useState<Measurements>({
		totalHeight: 0,
		rangeHeight: 0,
		handlePosition: 0,
		rowPositions: [],
	});

	const sliderRef = useRef<HTMLDivElement>(null);

	/**
	 * 모든 행의 높이와 위치를 계산하는 함수
	 * - 전체 높이 계산
	 * - 선택된 블록의 시작/끝 위치 계산
	 * - 각 행의 정확한 offset 위치 저장
	 * - 드래그 핸들의 위치 계산
	 */
	const calculateHeights = useCallback(() => {
		// 모든 드래그 가능한 행 요소들을 선택
		const rows = document.querySelectorAll('[data-row-id]');
		// 선택된 블록의 시작/끝 위치와 전체 높이 초기화
		let [blockHeadTop, blockTailBot, totalH] = [Infinity, 0, 0];
		const positions: number[] = [];

		rows.forEach((row, index) => {
			// 각 행의 크기와 위치 정보를 가져옴
			const rect = row.getBoundingClientRect();
			// 각 행의 상단 위치를 저장
			positions[index] = (row as HTMLElement).offsetTop;
			// 전체 높이 누적
			totalH += rect.height;

			// 선택된 행들의 범위를 계산
			if (selectedRows.includes(index)) {
				// 선택된 블록의 시작 위치를 갱신 (가장 위쪽)
				blockHeadTop = Math.min(blockHeadTop, (row as HTMLElement).offsetTop);
				// 선택된 블록의 끝 위치를 갱신 (가장 아래쪽)
				blockTailBot = Math.max(blockTailBot, (row as HTMLElement).offsetTop + rect.height);
			}
		});

		// 선택된 블록의 전체 높이 계산
		const rangeH = blockTailBot - blockHeadTop;
		// 드래그 핸들의 수직 위치 계산 (블록 중앙에 위치)
		const handlePos = blockHeadTop + rangeH / 2 - HANDLE_VERTICAL_OFFSET;

		setMeasurements({
			totalHeight: totalH,
			rangeHeight: rangeH,
			handlePosition: handlePos,
			rowPositions: positions,
		});
	}, [selectedRows]);

	/**
	 * 각 행의 경계(top, bottom)를 계산하는 유틸리티 함수
	 * @param rowPositions - 각 행의 상대적 위치 배열
	 * @returns 각 행의 상세 경계 정보 (top, bottom, index, height)
	 */
	const getRowBoundaries = useCallback((rowPositions: number[]): RowBoundary[] => {
		return rowPositions.map((position, index) => {
			// 각 행의 DOM 요소를 찾음
			const row = document.querySelector(`[data-row-id="${index}"]`);
			// 행이 존재하지 않으면 기본값 반환
			if (!row) return { top: position, bottom: position, index, height: 0 };

			// 행의 실제 크기 정보를 가져옴
			const rect = row.getBoundingClientRect();
			return {
				top: position,
				bottom: position + rect.height,
				index,
				height: rect.height,
			};
		});
	}, []);

	/**
	 * 현재 마우스 Y좌표를 기반으로 드래그 대상이 위치할 행 인덱스 계산
	 * @param mouseY - 현재 마우스의 Y 좌표
	 * @returns 목표 행 인덱스 또는 null
	 */
	const getTargetIndex = useCallback(
		(mouseY: number): number | null => {
			// 슬라이더의 위치 정보를 가져옴
			const sliderRect = sliderRef.current?.getBoundingClientRect();
			if (!sliderRect) return null;

			// 마우스의 상대적 Y 위치 계산
			const relativeY = mouseY - sliderRect.top;
			// 모든 행의 경계 정보를 가져옴
			const rowBoundaries = getRowBoundaries(measurements.rowPositions);

			// 각 행을 순회하며 마우스가 위치한 행을 찾음
			for (let i = 0; i < rowBoundaries.length; i++) {
				const current = rowBoundaries[i];
				// 행의 중간 지점 계산
				const rowMiddle = current.top + current.height / 2;

				// 마우스가 행의 중간보다 위에 있으면 해당 인덱스 반환
				if (relativeY <= rowMiddle) {
					return i;
				}
			}

			// 마우스가 모든 행보다 아래에 있으면 마지막 인덱스 반환
			return rowBoundaries.length;
		},
		[measurements.rowPositions, getRowBoundaries]
	);

	/**
	 * 드래그 시작 시 호출되는 이벤트 핸들러
	 * - 초기 마우스 위치 저장
	 * - 드래그 상태 활성화
	 */
	const handleMouseDown = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!sliderRef.current) return;

		const sliderRect = sliderRef.current.getBoundingClientRect();
		const mouseY = e.clientY - sliderRect.top;

		setDragState({
			isDragging: true,
			startY: mouseY,
			dragOffset: 0,
		});
	};

	/**
	 * 드래그 중 실시간으로 호출되는 이벤트 핸들러
	 * - 드래그 위치에 따른 시각적 피드백 제공
	 * - 유효한 드롭 위치 검증
	 * - 미리보기 효과 처리
	 */
	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!dragState.isDragging || !sliderRef.current) return;

			// 마우스의 상대적 위치와 드래그 거리 계산
			const sliderRect = sliderRef.current.getBoundingClientRect();
			const mouseY = e.clientY - sliderRect.top;
			const diff = mouseY - dragState.startY;

			const targetIndex = getTargetIndex(e.clientY);
			if (targetIndex !== null) {
				// 이전 미리보기 효과 제거
				document.querySelectorAll('.preview-move, .preview-move-invalid').forEach((el) => {
					el.classList.remove('preview-move', 'preview-move-invalid');
				});

				// 선택된 행들의 범위 계산
				const minSelectedIndex = Math.min(...selectedRows);
				const maxSelectedIndex = Math.max(...selectedRows);
				const rowBoundaries = getRowBoundaries(measurements.rowPositions);
				const targetRow = document.querySelector(
					`[data-row-id="${targetIndex}"]`
				) as HTMLElement;

				if (targetRow) {
					// 드롭이 불가능한 위치(선택된 블록 내부)인 경우 invalid 스타일 추가
					if (targetIndex >= minSelectedIndex && targetIndex <= maxSelectedIndex + 1) {
						targetRow.classList.add('preview-move', 'preview-move-invalid');
					} else {
						targetRow.classList.add('preview-move');
					}
				}

				// 마지막 행 이후로 드래그하는 경우 특별한 미리보기 라인 생성
				if (targetIndex === rowBoundaries.length) {
					const lastRow = document.querySelector(
						`[data-row-id="${rowBoundaries.length - 1}"]`
					) as HTMLElement;
					if (lastRow) {
						const previewLine = document.createElement('div');
						previewLine.className = 'preview-move';
						previewLine.style.position = 'absolute';
						previewLine.style.top = `${lastRow.offsetTop + lastRow.offsetHeight}px`;
						previewLine.style.width = '100%';
						previewLine.style.height = '2px';
						previewLine.style.backgroundColor = 'blue';
						lastRow.parentElement?.appendChild(previewLine);
					}
				}

				// 미리보기 업데이트 콜백 호출 및 드래그 상태 업데이트
				onPreviewMove?.(minSelectedIndex, targetIndex);
				setDragState((prev) => ({ ...prev, dragOffset: diff }));
			}
		},
		[
			dragState.isDragging,
			dragState.startY,
			selectedRows,
			onPreviewMove,
			getTargetIndex,
			measurements.rowPositions,
			getRowBoundaries,
		]
	);

	/**
	 * 드래그 종료 시 호출되는 이벤트 핸들러
	 * - 최종 드롭 위치 유효성 검증
	 * - 실제 행 이동 실행
	 * - 드래그 상태 및 시각적 효과 초기화
	 */
	const handleMouseUp = useCallback(() => {
		if (!dragState.isDragging) return;

		// 현재 미리보기 요소의 행 인덱스를 가져옴
		const previewElement = document.querySelector('.preview-move');
		const targetIndex = previewElement
			? parseInt(previewElement.getAttribute('data-row-id') || '0')
			: null;

		// 모든 미리보기 효과 제거
		document.querySelectorAll('.preview-move, .preview-move-invalid').forEach((el) => {
			el.classList.remove('preview-move', 'preview-move-invalid');
		});

		// 선택된 행들의 범위 계산
		const minSelectedIndex = Math.min(...selectedRows);
		const maxSelectedIndex = Math.max(...selectedRows);

		// 유효한 드롭 위치인 경우에만 이동 실행
		if (
			targetIndex !== null &&
			(targetIndex < minSelectedIndex || targetIndex > maxSelectedIndex + 1)
		) {
			onMoveRows?.();
		}

		// 드래그 상태 초기화
		setDragState({
			isDragging: false,
			startY: 0,
			dragOffset: 0,
		});
	}, [dragState.isDragging, selectedRows, onMoveRows]);

	/**
	 * 컴포넌트 마운트/업데이트 시 높이 계산 및 리사이즈 이벤트 처리
	 */
	useEffect(() => {
		calculateHeights();
		window.addEventListener('resize', calculateHeights);
		return () => window.removeEventListener('resize', calculateHeights);
	}, [calculateHeights, rows]);

	/**
	 * 드래그 상태에 따른 이벤트 리스너 관리
	 * - 마우스 이벤트 바인딩
	 * - ESC 키를 통한 드래그 취소 기능
	 * - 이벤트 리스너 클린업
	 */
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && dragState.isDragging) {
				handleMouseUp();
				onPreviewMove?.(0, null);
			}
		};

		const cleanup = () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
			document.removeEventListener('keydown', handleKeyDown);
		};

		if (dragState.isDragging) {
			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
			document.addEventListener('keydown', handleKeyDown);
			return cleanup;
		}

		cleanup();
	}, [dragState.isDragging, handleMouseMove, handleMouseUp, onPreviewMove]);

	if (selectedRows.length === 0) return null;

	return (
		<div
			ref={sliderRef}
			className="absolute h-full -left-8"
			style={{ height: `${measurements.totalHeight}px` }}
		>
			<RangeSliderBar
				totalHeight={measurements.totalHeight}
				rangeHeight={measurements.rangeHeight}
				handlePosition={measurements.handlePosition}
				isDragging={dragState.isDragging}
				dragOffset={dragState.dragOffset}
				onMouseDown={handleMouseDown}
			/>

			<DragHandleButton
				handlePosition={measurements.handlePosition}
				isDragging={dragState.isDragging}
				dragOffset={dragState.dragOffset}
				onMouseDown={handleMouseDown}
			/>
		</div>
	);
}

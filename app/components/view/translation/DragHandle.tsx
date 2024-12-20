import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * DragHandle 컴포넌트의 Props 타입 정의
 */
interface DragHandleProps {
	selectedRows: number[]; // 현재 선택된 행들의 인덱스 배열
	totalRows: number; // 테이블의 전체 행 개수
	onMoveRows?: () => void; // 행 이동이 완료된 후 실행될 콜백 함수
	onPreviewMove?: (fromIndex: number, toIndex: number | null) => void; // 이동 미리보기 표현 시 실행함수
	rows: any[]; // 테이블의 전체 데이터 배열
}

/**
 * 시각적 구조:
 * ┌────────────────┐
 * │  일반 행      │ ← offsetTop
 * ├────────────────┤
 * │  선택된 행 1  │ ← minTop
 * ├────────────────┤     ↕ rangeHeight
 * │  선택된 행 2  │ ← handlePosition
 * ├────────────────┤
 * │  선택된 행 3  │ ← maxBottom
 * ├────────────────┤
 * │  일반 행      │
 * └────────────────┘
 *   ↔ height
 */

export default function DragHandle({
	selectedRows,
	totalRows,
	onMoveRows,
	onPreviewMove,
	rows,
}: DragHandleProps) {
	// 드래그 상태 관리
	const [isDragging, setIsDragging] = useState(false);
	const [startY, setStartY] = useState(0);
	const [dragOffset, setDragOffset] = useState(0); // 드래그 오프셋 상태 추가

	// 크기 및 위치 상태 관리
	const [totalHeight, setTotalHeight] = useState(0);
	const [rangeHeight, setRangeHeight] = useState(0);
	const [handlePosition, setHandlePosition] = useState(0);
	const [rowPositions, setRowPositions] = useState<number[]>([]);

	// DOM 요소 참조
	const handleRef = useRef<HTMLDivElement>(null);
	const sliderRef = useRef<HTMLDivElement>(null);

	// 테이블의 모든 행들의 높이와 위치를 계산하는 함수
	const calculateHeights = () => {
		// 1. 모든 테이블 행 요소 선택
		const rows = document.querySelectorAll('[data-row-id]');
		let totalH = 0;
		let rangeH = 0;
		let minTop = Infinity; // 선택된 행들 중 가장 위에 있는 행의 위치
		let maxBottom = 0; // 선택된 행들 중 가장 아래 있는 행의 아래쪽 끝 위치
		const positions: number[] = []; // 각 행의 상대적 위치 저장

		// 각 행의 높이와 위치 계산
		rows.forEach((row, index) => {
			const rect = row.getBoundingClientRect(); // 요소의 크기와 뷰포트 상대 위치 정보를 가져옴
			positions[index] = (row as HTMLElement).offsetTop; // 행의 상대적 위치 (스크롤 위치와 무관)
			totalH += rect.height;

			// 선택된 행들의 범위 계산
			if (selectedRows.includes(index)) {
				minTop = Math.min(minTop, (row as HTMLElement).offsetTop);
				maxBottom = Math.max(maxBottom, (row as HTMLElement).offsetTop + rect.height);
			}
		});

		// 4. 계산된 값들로 상태 업데이트
		rangeH = maxBottom - minTop; // 선택된 행들의 전체 높이
		const handlePos = minTop + rangeH / 2 - 14; // 핸들 위치 (중앙에 배치)

		setTotalHeight(totalH); // 전체 테이블 높이
		setRangeHeight(rangeH); // 선택된 영역의 높이
		setHandlePosition(handlePos); // 드래그 핸들의 위치
		setRowPositions(positions); // 각 행의 위치 배열
	};

	/**
	 * 현재 마우스 위치에 해당하는 대상 행의 인덱스를 계산
	 *
	 * 시각적 구조:
	 * ┌────────────────┐ ← sliderRect.top
	 * │     행 1      │
	 * ├────────────────┤
	 * │     행 2      │ ← mouseY
	 * ├────────────────┤     ↕ relativeY
	 * │     행 3      │ ← rowMiddle
	 * ├────────────────┤
	 * │     행 4      │
	 * └────────────────┘
	 */
	const getTargetIndex = (mouseY: number): number | null => {
		const sliderRect = sliderRef.current?.getBoundingClientRect();
		if (!sliderRect) return null;

		const relativeY = mouseY - sliderRect.top;

		// 각 행의 경계 위치 계산
		const rowBoundaries = rowPositions.map((position, index) => {
			const row = document.querySelector(`[data-row-id="${index}"]`);
			if (!row) return { top: position, bottom: position, index };

			const rect = row.getBoundingClientRect();
			return {
				top: position,
				bottom: position + rect.height,
				index,
			};
		});

		// 선택되지 않은 행들만 고려
		const unselectedBoundaries = rowBoundaries.filter(
			(_, index) => !selectedRows.includes(index)
		);

		// 마우스가 위치한 행 찾기
		for (let i = 0; i < unselectedBoundaries.length; i++) {
			const current = unselectedBoundaries[i];
			const next = unselectedBoundaries[i + 1];

			// 현재 행의 영역 내에 있는 경우
			if (relativeY >= current.top && relativeY <= current.bottom) {
				const middlePoint = (current.top + current.bottom) / 2;
				// 행의 위쪽 절반에 있으면 현재 행, 아래쪽 절반에 있으면 다음 행의 인덱스
				return relativeY < middlePoint ? current.index : (next?.index ?? current.index);
			}
		}

		// 경계값 처리
		if (relativeY <= unselectedBoundaries[0].top) return unselectedBoundaries[0].index;
		if (relativeY >= unselectedBoundaries[unselectedBoundaries.length - 1].bottom) {
			// 마지막 행의 실제 인덱스 반환
			return rowBoundaries[rowBoundaries.length - 1].index;
		}

		return null;
	};

	/**
	 * 마우스 드래그 동작의 시각적 구조:
	 */
	const handleMouseDown = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!sliderRef.current) return;

		const sliderRect = sliderRef.current.getBoundingClientRect();
		const mouseY = e.clientY - sliderRect.top;

		// 상태 업데이트를 한 번에 처리
		Promise.resolve().then(() => {
			setIsDragging(true);
			setStartY(mouseY);
			setDragOffset(0);
		});

		// 이벤트 리스너 등록 전에 기존 리스너 제거
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
	};

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isDragging || !sliderRef.current) return;

			const sliderRect = sliderRef.current.getBoundingClientRect();
			const mouseY = e.clientY - sliderRect.top;
			const diff = mouseY - startY;

			// 성능 최적화: requestAnimationFrame 사용
			requestAnimationFrame(() => {
				const targetIndex = getTargetIndex(e.clientY);
				if (targetIndex !== null) {
					const minSelectedIndex = Math.min(...selectedRows);
					const maxSelectedIndex = Math.max(...selectedRows);
					const selectedRowsCount = selectedRows.length;

					// 맨 위에 있는 블록들을 위로 드래그할 때 처리
					if (minSelectedIndex === 0) {
						const isMovingUp = diff < 0;
						if (isMovingUp) {
							setDragOffset(0);
							onPreviewMove?.(minSelectedIndex, 0);
							return;
						}
					}

					// 선택된 행들의 실제 높이 계산 최적화
					const selectedRowsHeight = selectedRows.reduce((total, index) => {
						const row = document.querySelector(`[data-row-id="${index}"]`);
						if (!row) return total;
						return total + row.getBoundingClientRect().height;
					}, 0);

					// 이동 가능 범위 계산
					const firstRowTop = rowPositions[0];
					const lastRowElement = document.querySelector(
						`[data-row-id="${rows.length - 1}"]`
					);
					const lastRowRect = lastRowElement?.getBoundingClientRect();
					const lastRowBottom = lastRowRect
						? rowPositions[rowPositions.length - 1] + lastRowRect.height
						: rowPositions[rowPositions.length - 1];

					// 이동 제한 범위 계산
					const currentTop = rowPositions[minSelectedIndex];
					const maxOffset = lastRowBottom - selectedRowsHeight - currentTop;
					const minOffset = -currentTop;

					// 실제 적용할 오프셋 계산
					const limitedOffset = Math.max(minOffset, Math.min(maxOffset, diff));

					// 맨 위나 맨 아래로 이동할 때 특별 처리
					let effectiveTargetIndex = targetIndex;
					if (targetIndex === 0 && minSelectedIndex === 0) {
						effectiveTargetIndex = 0;
					} else if (targetIndex >= rows.length - selectedRowsCount) {
						effectiveTargetIndex = rows.length - selectedRowsCount;
					}

					onPreviewMove?.(minSelectedIndex, effectiveTargetIndex);

					// DOM 조작 최적화
					const targetRow = document.querySelector(
						`[data-row-id="${effectiveTargetIndex}"]`
					) as HTMLElement;

					if (targetRow) {
						document.querySelectorAll('.preview-move').forEach((el) => {
							el.classList.remove('preview-move');
						});
						targetRow.classList.add('preview-move');

						setDragOffset(limitedOffset);
					}
				}
			});
		},
		[isDragging, startY, selectedRows, onPreviewMove, getTargetIndex, rowPositions, rows.length]
	);

	const handleMouseUp = () => {
		if (!isDragging) return;

		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);

		// 모든 미리보기 클래스 제거
		document.querySelectorAll('.preview-move').forEach((el) => {
			el.classList.remove('preview-move');
		});

		if (onMoveRows) {
			onMoveRows();
		}

		// 드래그 상태 초기화
		setIsDragging(false);
		setStartY(0);
		setDragOffset(0);
	};

	/**
	 * 이벤트 리스너 및 상태 관리를 위한 부수 효과
	 */
	useEffect(() => {
		calculateHeights();
		window.addEventListener('resize', calculateHeights);
		return () => window.removeEventListener('resize', calculateHeights);
	}, [selectedRows, rows]);

	useEffect(() => {
		console.log('totalHeight', totalHeight);
		console.log('rangeHeight', rangeHeight);
		console.log('handlePosition', handlePosition);
		console.log('rowPositions', rowPositions);
		console.log('--------------------------------------------');
	}, [totalHeight, rangeHeight, handlePosition, rowPositions]);

	// ESC 키 감지를 위한 이벤트 리스너
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isDragging) {
				setIsDragging(false);
				setStartY(0);
				setDragOffset(0);

				// 모든 미리보기 클래스 제거
				document.querySelectorAll('.preview-move').forEach((el) => {
					el.classList.remove('preview-move');
				});

				onPreviewMove?.(0, null);
				document.removeEventListener('mousemove', handleMouseMove);
				document.removeEventListener('mouseup', handleMouseUp);
			}
		};

		if (isDragging) {
			document.addEventListener('keydown', handleKeyDown);
			return () => document.removeEventListener('keydown', handleKeyDown);
		}
	}, [isDragging]);

	// 컴포넌트 언마운트 시 이벤트 리스너 정리
	useEffect(() => {
		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	}, [handleMouseMove]); // handleMouseMove 의존성 추가

	// 드래그 시작 시 이벤트 리스너 설정
	useEffect(() => {
		if (isDragging) {
			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
			return () => {
				document.removeEventListener('mousemove', handleMouseMove);
				document.removeEventListener('mouseup', handleMouseUp);
			};
		}
	}, [isDragging, handleMouseMove]);

	// 선택된 행이 없으면 렌더링하지 않음
	if (selectedRows.length === 0) return null;

	// 선택된 영역 표시 바 스타일 계산 최적화
	const getRangeBarStyle = useCallback(() => {
		const baseStyle = {
			height: `${rangeHeight}px`,
			top: `${handlePosition - rangeHeight / 2 + 14}px`,
			transition: isDragging ? 'none' : 'all 0.15s ease-out',
			transform: isDragging ? `translateY(${dragOffset}px)` : 'none',
			willChange: isDragging ? 'transform' : 'auto',
		};

		return baseStyle;
	}, [rangeHeight, handlePosition, isDragging, dragOffset]);

	// 드래그 핸들 스타일 계산 최적화
	const getHandleStyle = useCallback(() => {
		const baseStyle = {
			top: `${handlePosition}px`,
			transition: isDragging ? 'none' : 'all 0.15s ease-out',
			transform: isDragging ? `translateY(${dragOffset}px)` : 'none',
			willChange: isDragging ? 'transform' : 'auto',
		};

		return baseStyle;
	}, [handlePosition, isDragging, dragOffset]);

	return (
		<div
			ref={sliderRef}
			className="absolute h-full -left-8"
			style={{ height: `${totalHeight}px` }}
		>
			{/* 전체 레인지 슬라이더 바 */}
			<div
				className="absolute w-3 bg-gray-200 left-3 cursor-grab active:cursor-grabbing"
				style={{
					height: '100%',
					top: '0px',
				}}
				onMouseDown={handleMouseDown}
			/>

			{/* 선택된 영역 표시 바 */}
			<div
				className={`absolute left-3 w-3 bg-blue-500 cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50' : ''}`}
				style={getRangeBarStyle()}
				onMouseDown={handleMouseDown}
			/>

			{/* 드래그 핸들 버튼 */}
			<div
				ref={handleRef}
				className={`absolute left-1 flex items-center justify-center w-7 h-7 bg-blue-600 rounded-full shadow-md hover:bg-blue-700 cursor-grab active:cursor-grabbing ${isDragging ? 'z-50' : 'z-10'}`}
				style={getHandleStyle()}
				onMouseDown={handleMouseDown}
			>
				<div className="flex flex-col items-center justify-center gap-1">
					<div className="w-4 h-0.5 bg-white rounded"></div>
					<div className="w-4 h-0.5 bg-white rounded"></div>
					<div className="w-4 h-0.5 bg-white rounded"></div>
				</div>
			</div>
		</div>
	);
}

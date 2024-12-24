import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RangeSliderBar } from './RangeSliderBar';
import { DragHandleButton } from './DragHandleButton';
import { HANDLE_VERTICAL_OFFSET } from '@/data/constant/dragHandle';

interface DragHandleProps {
	selectedRows: number[];
	totalRows: number;
	onMoveRows?: () => void;
	onPreviewMove?: (fromIndex: number, toIndex: number | null) => void;
	rows: any[];
}

interface DragState {
	isDragging: boolean;
	startY: number;
	dragOffset: number;
}

interface Measurements {
	totalHeight: number;
	rangeHeight: number;
	handlePosition: number;
	rowPositions: number[];
}

interface RowBoundary {
	top: number;
	bottom: number;
	index: number;
	height: number;
}

export default function DragHandle({
	selectedRows,
	totalRows,
	onMoveRows,
	onPreviewMove,
	rows,
}: DragHandleProps) {
	const [dragState, setDragState] = useState<DragState>({
		isDragging: false,
		startY: 0,
		dragOffset: 0,
	});

	const [measurements, setMeasurements] = useState<Measurements>({
		totalHeight: 0,
		rangeHeight: 0,
		handlePosition: 0,
		rowPositions: [],
	});

	const sliderRef = useRef<HTMLDivElement>(null);

	const calculateHeights = useCallback(() => {
		const rows = document.querySelectorAll('[data-row-id]');
		let totalH = 0;
		let minTop = Infinity;
		let maxBottom = 0;
		const positions: number[] = [];

		rows.forEach((row, index) => {
			const rect = row.getBoundingClientRect();
			positions[index] = (row as HTMLElement).offsetTop;
			totalH += rect.height;

			if (selectedRows.includes(index)) {
				minTop = Math.min(minTop, (row as HTMLElement).offsetTop);
				maxBottom = Math.max(maxBottom, (row as HTMLElement).offsetTop + rect.height);
			}
		});

		const rangeH = maxBottom - minTop;
		const handlePos = minTop + rangeH / 2 - HANDLE_VERTICAL_OFFSET;

		setMeasurements({
			totalHeight: totalH,
			rangeHeight: rangeH,
			handlePosition: handlePos,
			rowPositions: positions,
		});
	}, [selectedRows]);

	const getRowBoundaries = useCallback((rowPositions: number[]): RowBoundary[] => {
		return rowPositions.map((position, index) => {
			const row = document.querySelector(`[data-row-id="${index}"]`);
			if (!row) return { top: position, bottom: position, index, height: 0 };

			const rect = row.getBoundingClientRect();
			return {
				top: position,
				bottom: position + rect.height,
				index,
				height: rect.height,
			};
		});
	}, []);

	const getTargetIndex = useCallback(
		(mouseY: number): number | null => {
			const sliderRect = sliderRef.current?.getBoundingClientRect();
			if (!sliderRect) return null;

			const relativeY = mouseY - sliderRect.top;
			const rowBoundaries = getRowBoundaries(measurements.rowPositions);

			for (let i = 0; i < rowBoundaries.length; i++) {
				const current = rowBoundaries[i];
				const rowMiddle = current.top + current.height / 2;

				if (relativeY <= rowMiddle) {
					return i;
				}
			}

			return rowBoundaries.length;
		},
		[measurements.rowPositions, getRowBoundaries]
	);

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

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!dragState.isDragging || !sliderRef.current) return;

			const sliderRect = sliderRef.current.getBoundingClientRect();
			const mouseY = e.clientY - sliderRect.top;
			const diff = mouseY - dragState.startY;

			const targetIndex = getTargetIndex(e.clientY);
			if (targetIndex !== null) {
				document.querySelectorAll('.preview-move, .preview-move-invalid').forEach((el) => {
					el.classList.remove('preview-move', 'preview-move-invalid');
				});

				const minSelectedIndex = Math.min(...selectedRows);
				const maxSelectedIndex = Math.max(...selectedRows);
				const rowBoundaries = getRowBoundaries(measurements.rowPositions);
				const targetRow = document.querySelector(
					`[data-row-id="${targetIndex}"]`
				) as HTMLElement;

				if (targetRow) {
					if (targetIndex >= minSelectedIndex && targetIndex <= maxSelectedIndex + 1) {
						targetRow.classList.add('preview-move', 'preview-move-invalid');
					} else {
						targetRow.classList.add('preview-move');
					}
				}

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

	const handleMouseUp = useCallback(() => {
		if (!dragState.isDragging) return;

		const previewElement = document.querySelector('.preview-move');
		const targetIndex = previewElement
			? parseInt(previewElement.getAttribute('data-row-id') || '0')
			: null;

		document.querySelectorAll('.preview-move, .preview-move-invalid').forEach((el) => {
			el.classList.remove('preview-move', 'preview-move-invalid');
		});

		const minSelectedIndex = Math.min(...selectedRows);
		const maxSelectedIndex = Math.max(...selectedRows);

		if (
			targetIndex !== null &&
			(targetIndex < minSelectedIndex || targetIndex > maxSelectedIndex + 1)
		) {
			onMoveRows?.();
		}

		setDragState({
			isDragging: false,
			startY: 0,
			dragOffset: 0,
		});
	}, [dragState.isDragging, selectedRows, onMoveRows]);

	useEffect(() => {
		calculateHeights();
		window.addEventListener('resize', calculateHeights);
		return () => window.removeEventListener('resize', calculateHeights);
	}, [calculateHeights, rows]);

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

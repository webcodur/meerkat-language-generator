import { useState, useCallback, useEffect } from "react";
import {
  DragState,
  RowPosition,
  HandlePosition,
  DragMeasurements,
} from "@/types/dragHandle";

interface UseDragHandleProps {
  selectedRows: number[];
  onPreviewMove: (fromIndex: number, toIndex: number | null) => void;
  onMoveRows: () => void;
}

export default function useDragHandle({
  selectedRows,
  onPreviewMove,
  onMoveRows,
}: UseDragHandleProps) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startY: 0,
    dragOffset: 0,
  });

  const [measurements, setMeasurements] = useState<DragMeasurements>({
    handlePosition: { top: 0, height: 0, center: 0 },
    rowPositions: [],
    containerHeight: 0,
  });

  const [targetIndex, setTargetIndex] = useState<number | null>(null);

  // 행 위치 정보 계산
  const calculateRowPositions = useCallback((): RowPosition[] => {
    const rows = document.querySelectorAll("[data-row-id]");
    const positions: RowPosition[] = [];

    rows.forEach((row) => {
      const index = parseInt(row.getAttribute("data-row-id") || "0", 10);
      const rect = row.getBoundingClientRect();
      const top = (row as HTMLElement).offsetTop;
      const height = rect.height;
      const bottom = top + height;

      positions[index] = {
        index,
        top,
        height,
        bottom,
        center: top + height / 2,
      };
    });

    return positions;
  }, []);

  // 핸들 위치 계산
  const calculateHandlePosition = useCallback(
    (rowPositions: RowPosition[]): HandlePosition => {
      const selectedPositions = selectedRows
        .map((index) => rowPositions[index])
        .filter(Boolean);

      if (selectedPositions.length === 0) {
        return { top: 0, height: 0, center: 0 };
      }

      const top = Math.min(...selectedPositions.map((pos) => pos.top));
      const bottom = Math.max(...selectedPositions.map((pos) => pos.bottom));
      const height = bottom - top;

      // 선택된 행들의 실제 중앙점 계산
      const center =
        selectedPositions.reduce((sum, pos) => sum + pos.center, 0) /
        selectedPositions.length;

      return { top, height, center };
    },
    [selectedRows]
  );

  // 측정값 업데이트
  const updateMeasurements = useCallback(() => {
    requestAnimationFrame(() => {
      const rowPositions = calculateRowPositions();
      const handlePosition = calculateHandlePosition(rowPositions);
      const containerHeight = Math.max(
        ...rowPositions.map((pos) => pos.bottom),
        0
      );

      setMeasurements({
        handlePosition,
        rowPositions,
        containerHeight,
      });
    });
  }, [calculateRowPositions, calculateHandlePosition]);

  // 드래그 시작
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const startY = e.clientY;
    setDragState({
      isDragging: true,
      startY,
      dragOffset: 0,
    });
  }, []);

  // 드래그 중
  const handleDrag = useCallback(
    (e: MouseEvent) => {
      if (!dragState.isDragging) return;

      const currentY = e.clientY;
      const dragOffset = currentY - dragState.startY;

      // 현재 마우스 위치에서 가장 가까운 행 찾기
      const handleCenter = measurements.handlePosition.center + dragOffset;
      const targetPosition = measurements.rowPositions.find(
        (pos) => handleCenter <= pos.center
      );

      // 미리보기 업데이트
      const minSelectedIndex = Math.min(...selectedRows);
      const maxSelectedIndex = Math.max(...selectedRows);
      const newTargetIndex = targetPosition
        ? targetPosition.index
        : measurements.rowPositions.length;

      // 유효한 드롭 위치인 경우에만 미리보기 업데이트
      if (
        newTargetIndex < minSelectedIndex ||
        newTargetIndex > maxSelectedIndex + 1
      ) {
        setTargetIndex(newTargetIndex);
        onPreviewMove(minSelectedIndex, newTargetIndex);
      } else {
        setTargetIndex(null);
        onPreviewMove(minSelectedIndex, null);
      }

      setDragState((prev) => ({
        ...prev,
        dragOffset,
      }));
    },
    [
      dragState.isDragging,
      dragState.startY,
      measurements,
      selectedRows,
      onPreviewMove,
    ]
  );

  // 드래그 종료
  const handleDragEnd = useCallback(() => {
    // 유효한 드롭 위치가 있는 경우에만 이동 실행
    if (targetIndex !== null) {
      onMoveRows();
    }

    // 상태 초기화
    setDragState({
      isDragging: false,
      startY: 0,
      dragOffset: 0,
    });
    setTargetIndex(null);
    onPreviewMove(0, null);
  }, [targetIndex, onMoveRows, onPreviewMove]);

  // 이벤트 리스너 관리
  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener("mousemove", handleDrag);
      document.addEventListener("mouseup", handleDragEnd);
      return () => {
        document.removeEventListener("mousemove", handleDrag);
        document.removeEventListener("mouseup", handleDragEnd);
      };
    }
  }, [dragState.isDragging, handleDrag, handleDragEnd]);

  // 선택된 행이 변경될 때마다 측정값 업데이트
  useEffect(() => {
    updateMeasurements();
    window.addEventListener("resize", updateMeasurements);
    return () => window.removeEventListener("resize", updateMeasurements);
  }, [selectedRows, updateMeasurements]);

  return {
    dragState,
    measurements,
    handleDragStart,
  };
}

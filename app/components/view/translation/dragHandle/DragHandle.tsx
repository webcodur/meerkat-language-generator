import React from "react";
import { RangeSliderBar } from "./RangeSliderBar";
import { DragHandleButton } from "./DragHandleButton";
import { DragHandleProps } from "@/types/dragHandle";
import useDragHandle from "@/hooks/useDragHandle";

export default function DragHandle({
  selectedRows,
  onMoveRows,
  onPreviewMove,
}: DragHandleProps) {
  const { dragState, measurements, handleDragStart } = useDragHandle({
    selectedRows,
    onPreviewMove,
    onMoveRows,
  });

  if (selectedRows.length === 0) return null;

  return (
    <div
      className="absolute z-[100] h-full -left-8"
      style={{
        height: `${measurements.containerHeight}px`,
        pointerEvents: "all",
      }}
    >
      <RangeSliderBar
        handlePosition={measurements.handlePosition}
        isDragging={dragState.isDragging}
        dragOffset={dragState.dragOffset}
        onMouseDown={handleDragStart}
      />

      <DragHandleButton
        handlePosition={measurements.handlePosition}
        isDragging={dragState.isDragging}
        dragOffset={dragState.dragOffset}
        onMouseDown={handleDragStart}
      />
    </div>
  );
}

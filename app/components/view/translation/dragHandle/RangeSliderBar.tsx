import React from "react";
import { HandlePosition } from "@/types/dragHandle";

interface RangeSliderBarProps {
  handlePosition: HandlePosition;
  isDragging: boolean;
  dragOffset: number;
  onMouseDown: (e: React.MouseEvent) => void;
}

export const RangeSliderBar: React.FC<RangeSliderBarProps> = ({
  handlePosition,
  isDragging,
  dragOffset,
  onMouseDown,
}) => {
  const getRangeBarStyle = () => ({
    height: `${handlePosition.height}px`,
    top: `${handlePosition.top}px`,
    transition: isDragging ? "none" : "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
    transform: isDragging ? `translateY(${dragOffset}px)` : "none",
    willChange: isDragging ? "transform" : "auto",
  });

  return (
    <>
      {/* 전체 레인지 슬라이더 바 */}
      <div
        className="absolute w-2 bg-gray-100 rounded-full shadow-inner left-3 cursor-grab active:cursor-grabbing"
        style={{
          height: "100%",
          top: "0px",
        }}
        onMouseDown={onMouseDown}
      />

      {/* 선택된 영역 표시 바 */}
      <div
        className={`absolute left-3 w-2 bg-gray-400 cursor-grab active:cursor-grabbing rounded-full shadow-lg ${
          isDragging ? "opacity-70" : ""
        }`}
        style={getRangeBarStyle()}
        onMouseDown={onMouseDown}
      />
    </>
  );
};

import React from "react";

interface DragHandleButtonProps {
  handlePosition: number;
  isDragging: boolean;
  dragOffset: number;
  onMouseDown: (e: React.MouseEvent) => void;
}

export const DragHandleButton: React.FC<DragHandleButtonProps> = ({
  handlePosition,
  isDragging,
  dragOffset,
  onMouseDown,
}) => {
  const getHandleStyle = () => ({
    top: `${handlePosition}px`,
    transition: isDragging ? "none" : "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
    transform: isDragging ? `translateY(${dragOffset}px)` : "none",
    willChange: isDragging ? "transform" : "auto",
  });

  return (
    <div
      className={`absolute left-1 flex items-center justify-center w-7 h-7 bg-gray-400 hover:bg-gray-500 rounded-lg shadow-lg cursor-grab active:cursor-grabbing backdrop-blur-sm border border-gray-300/50 ${
        isDragging ? "z-50 scale-105" : "z-10"
      }`}
      style={getHandleStyle()}
      onMouseDown={onMouseDown}
    >
      <div className="flex flex-col items-center justify-center gap-[3px]">
        <div className="w-3.5 h-[2px] bg-white rounded-full"></div>
        <div className="w-3.5 h-[2px] bg-white rounded-full"></div>
        <div className="w-3.5 h-[2px] bg-white rounded-full"></div>
      </div>
    </div>
  );
};

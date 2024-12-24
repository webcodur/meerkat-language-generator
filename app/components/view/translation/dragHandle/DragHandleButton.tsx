import React from 'react';

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
		transition: isDragging ? 'none' : 'all 0.15s ease-out',
		transform: isDragging ? `translateY(${dragOffset}px)` : 'none',
		willChange: isDragging ? 'transform' : 'auto',
	});

	return (
		<div
			className={`absolute left-1 flex items-center justify-center w-7 h-7 bg-blue-600 rounded-full shadow-md hover:bg-blue-700 cursor-grab active:cursor-grabbing ${
				isDragging ? 'z-50' : 'z-10'
			}`}
			style={getHandleStyle()}
			onMouseDown={onMouseDown}
		>
			<div className="flex flex-col items-center justify-center gap-1">
				<div className="w-4 h-0.5 bg-white rounded"></div>
				<div className="w-4 h-0.5 bg-white rounded"></div>
				<div className="w-4 h-0.5 bg-white rounded"></div>
			</div>
		</div>
	);
};

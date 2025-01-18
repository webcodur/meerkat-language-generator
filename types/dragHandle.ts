export interface DragHandleProps {
  selectedRows: number[];
  totalRows: number;
  onMoveRows?: () => void;
  onPreviewMove?: (fromIndex: number, toIndex: number | null) => void;
  rows: any[];
}

export interface DragState {
  isDragging: boolean;
  startY: number;
  dragOffset: number;
}

export interface Measurements {
  totalHeight: number;
  rangeHeight: number;
  handlePosition: number;
  rowPositions: number[];
}

export interface RowBoundary {
  top: number;
  bottom: number;
  index: number;
  height: number;
}

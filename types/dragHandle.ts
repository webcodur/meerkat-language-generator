import { Translation } from "./translate";

export interface DragHandleProps {
  selectedRows: number[];
  totalRows: number;
  onMoveRows: () => void;
  onPreviewMove: (fromIndex: number, toIndex: number | null) => void;
  rows: Translation[];
}

export interface RowPosition {
  index: number;
  top: number;
  height: number;
  bottom: number;
  center: number;
}

export interface DragState {
  isDragging: boolean;
  startY: number;
  dragOffset: number;
}

export interface HandlePosition {
  top: number;
  height: number;
  center: number;
}

export interface DragMeasurements {
  handlePosition: HandlePosition;
  rowPositions: RowPosition[];
  containerHeight: number;
}

import { COLUMN_WIDTHS } from "@/data/constant/columnWidths";

interface RowNumberCellProps {
  index: number;
}

export default function RowNumberCell({ index }: RowNumberCellProps) {
  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: COLUMN_WIDTHS.number,
        minWidth: COLUMN_WIDTHS.number,
        maxWidth: COLUMN_WIDTHS.number,
      }}
    >
      {index + 1}
    </div>
  );
}

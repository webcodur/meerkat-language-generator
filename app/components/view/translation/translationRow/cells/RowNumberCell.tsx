import { COLUMNS } from "@/data/constant/columns";

interface RowNumberCellProps {
  index: number;
}

export default function RowNumberCell({ index }: RowNumberCellProps) {
  return (
    <div
      style={{
        width: COLUMNS[1].width,
        minWidth: COLUMNS[1].width,
        maxWidth: COLUMNS[1].width,
      }}
      className="flex items-center justify-center text-gray-500"
    >
      {index + 1}
    </div>
  );
}

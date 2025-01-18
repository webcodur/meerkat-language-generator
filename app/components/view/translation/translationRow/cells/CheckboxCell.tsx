import { COLUMNS } from "@/data/constant/columns";

interface CheckboxCellProps {
  index: number;
  selectedRows: number[];
  onRowSelect: (index: number, selected: boolean) => void;
}

export default function CheckboxCell({
  index,
  selectedRows,
  onRowSelect,
}: CheckboxCellProps) {
  return (
    <div
      style={{
        width: COLUMNS[0].width,
        minWidth: COLUMNS[0].width,
        maxWidth: COLUMNS[0].width,
      }}
      className="flex items-center justify-center"
    >
      <input
        type="checkbox"
        checked={selectedRows.includes(index)}
        onChange={(e) => onRowSelect(index, e.target.checked)}
        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
      />
    </div>
  );
}

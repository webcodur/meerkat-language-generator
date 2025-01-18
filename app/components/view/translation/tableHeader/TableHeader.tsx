import { COLUMNS } from "@/data/constant/columns";

const headerCellStyle =
  "text-center flex items-center justify-center text-base font-medium text-primary-700 bg-gray-800 text-white border-b-2 border-gray-700 py-2 shadow-sm";

export default function TableHeader() {
  return (
    <div className="min-w-max sticky top-0 bg-white z-10 mb-2">
      <div className="flex gap-3">
        {COLUMNS.map((column, index) => (
          <div
            key={index}
            className={headerCellStyle}
            style={{
              width: column.width,
              minWidth: column.width,
              maxWidth: column.width,
              borderRadius: "4px",
            }}
          >
            {column.text}
          </div>
        ))}
      </div>
    </div>
  );
}

import { Translation } from "@/types/translate";
import { commonInputStyle } from "../styles";
import { COLUMNS } from "@/data/constant/columns";

interface KeyInputCellProps {
  row: Translation;
  index: number;
  onUpdate: (index: number, updatedRow: Translation) => void;
}

export default function KeyInputCell({
  row,
  index,
  onUpdate,
}: KeyInputCellProps) {
  return (
    <div
      style={{
        width: COLUMNS.find((col) => col.type === "key")?.width,
        minWidth: COLUMNS.find((col) => col.type === "key")?.width,
      }}
    >
      <input
        type="text"
        value={row.key}
        onChange={(e) => onUpdate(index, { ...row, key: e.target.value })}
        className={commonInputStyle}
        disabled={row.isVerified}
      />
    </div>
  );
}

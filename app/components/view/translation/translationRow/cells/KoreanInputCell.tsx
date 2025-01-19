import { Translation } from "@/types/translate";
import { commonInputStyle } from "../styles";
import { COLUMNS } from "@/data/constant/columns";

interface KoreanInputCellProps {
  row: Translation;
  index: number;
  onUpdate: (index: number, updatedRow: Translation) => void;
  type?: "koreanWord" | "koreanDescription";
}

export default function KoreanInputCell({
  row,
  index,
  onUpdate,
  type = "koreanWord",
}: KoreanInputCellProps) {
  const handleChange = (value: string) => {
    onUpdate(index, { ...row, [type]: value });
  };

  return (
    <input
      type="text"
      value={row[type]}
      onChange={(e) => handleChange(e.target.value)}
      className={commonInputStyle}
      style={{ width: COLUMNS.find((col) => col.type === type)?.width }}
      placeholder={type === "koreanWord" ? "한국어 입력" : "설명 입력"}
    />
  );
}

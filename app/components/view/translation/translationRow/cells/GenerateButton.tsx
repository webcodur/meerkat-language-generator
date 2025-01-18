import { COLUMNS } from "@/data/constant/columns";
import { Translation } from "@/types/translate";

interface GenerateButtonProps {
  row: Translation;
  index: number;
  loadingRows: { [key: number]: boolean };
  onSubmit: (index: number) => void;
}

export default function GenerateButton({
  row,
  index,
  loadingRows,
  onSubmit,
}: GenerateButtonProps) {
  const isLoading = loadingRows[index];
  const isDisabled = !row.koreanWord || row.isVerified;

  return (
    <div
      style={{
        width: COLUMNS[4].width,
        minWidth: COLUMNS[4].width,
        maxWidth: COLUMNS[4].width,
      }}
      className="flex items-center justify-center"
    >
      <button
        onClick={() => onSubmit(index)}
        disabled={isDisabled || isLoading}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
          isDisabled
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-blue-100 text-blue-600 hover:bg-blue-200"
        }`}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

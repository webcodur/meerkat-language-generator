import React from "react";
import { FaMinus } from "react-icons/fa";

interface DeleteButtonProps {
  onClick: () => void;
  disabled: boolean;
  width: number;
}

const DeleteButton = ({ onClick, disabled, width }: DeleteButtonProps) => {
  const buttonClass =
    "h-[38px] flex items-center justify-center text-white rounded text-sm font-medium transition-colors duration-200";

  return (
    <div
      className="flex items-center justify-center"
      style={{
        width,
        minWidth: width,
        maxWidth: width,
      }}
    >
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-[38px] ${buttonClass} ${
          disabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-red-500 hover:bg-red-600"
        }`}
      >
        <FaMinus className="w-3 h-3" />
      </button>
    </div>
  );
};

export default DeleteButton;

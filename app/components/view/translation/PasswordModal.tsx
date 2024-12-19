interface PasswordModalProps {
  password: string;
  passwordError: boolean;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export default function PasswordModal({
  password,
  passwordError,
  onPasswordChange,
  onSubmit,
  onClose
}: PasswordModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="p-6 bg-white rounded-lg w-80">
        <h3 className="mb-4 text-lg font-medium">비밀번호 입력</h3>
        <input
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSubmit();
            }
            if (e.key === 'Escape') {
              onClose();
            }
          }}
          autoFocus
          className="w-full p-2 mb-4 border rounded"
          placeholder="비밀번호를 입력하세요"
        />
        {passwordError && (
          <p className="mb-4 text-sm text-red-500">잘못된 비밀번호입니다</p>
        )}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
          >
            취소
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
} 
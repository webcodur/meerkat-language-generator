/**
 * 비밀번호 입력을 위한 모달 컴포넌트
 * @interface PasswordModalProps
 * @property {string} password - 현재 입력된 비밀번호 값
 * @property {boolean} passwordError - 비밀번호 오류 상태
 * @property {function} onPasswordChange - 비밀번호 변경 시 호출되는 콜백 함수
 * @property {function} onSubmit - 확인 버튼 클릭 시 호출되는 콜백 함수
 * @property {function} onClose - 모달 닫기 시 호출되는 콜백 함수
 */
interface PasswordModalProps {
  password: string;
  passwordError: boolean;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

/**
 * 비밀번호 입력 모달 컴포넌트
 *
 * 사용자로부터 비밀번호를 입력받는 모달 창을 렌더링합니다.
 * - 배경은 반투명한 검은색으로 처리됩니다.
 * - Enter 키를 누르면 확인 버튼과 동일한 동작을 수행합니다.
 * - Escape 키를 누르면 모달이 닫힙니다.
 * - 비밀번호 오류 시 에러 메시지를 표시합니다.
 */
export default function PasswordModal({
  password,
  passwordError,
  onPasswordChange,
  onSubmit,
  onClose,
}: PasswordModalProps) {
  return (
    // 전체 화면을 덮는 반투명한 배경
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {/* 모달 컨테이너 */}
      <div className="p-6 bg-white rounded-lg w-80">
        <h3 className="mb-4 text-lg font-medium">비밀번호 입력</h3>
        {/* 비밀번호 입력 필드 */}
        <input
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSubmit(); // Enter 키 입력 시 제출
            }
            if (e.key === "Escape") {
              onClose(); // Escape 키 입력 시 모달 닫기
            }
          }}
          autoFocus
          className="w-full p-2 mb-4 border rounded"
          placeholder="비밀번호를 입력하세요"
        />
        {/* 비밀번호 오류 메시지 */}
        {passwordError && (
          <p className="mb-4 text-sm text-primary-500">잘못된 비밀번호입니다</p>
        )}
        {/* 버튼 그룹 */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-primary-700 bg-primary-50 rounded hover:bg-primary-100"
          >
            취소
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 text-white bg-primary-500 rounded hover:bg-primary-600"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

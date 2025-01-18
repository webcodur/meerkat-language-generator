import { useState } from "react";

/**
 * 비밀번호 잠금 기능을 관리하는 커스텀 훅
 * @returns {Object} 잠금 상태 관리를 위한 상태값들과 핸들러 함수들
 */
export default function usePasswordLock() {
  const [isLocked, setIsLocked] = useState(true); // 현재 잠금 상태
  const [showModal, setShowModal] = useState(false); // 비밀번호 입력 모달 표시 상태
  const [password, setPassword] = useState(""); // 사용자 입력한 비밀번호
  const [passwordError, setPasswordError] = useState(false); // 비밀번호 오류 상태

  // 비밀번호 제출 처리 함수
  const handlePasswordSubmit = () => {
    if (password === "meerkat") {
      setIsLocked(false);
      setShowModal(false);
      setPassword("");
      setPasswordError(false);
      alert("잠금이 성공적으로 해제되었습니다.");
    } else {
      setPasswordError(true);
    }
  };

  // 비밀번호 입력값 변경 처리 함수
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordError(false);
  };

  // 모달 닫기 처리 함수
  const handleModalClose = () => {
    setShowModal(false);
    setPassword("");
    setPasswordError(false);
  };

  return {
    isLocked,
    showModal,
    password,
    passwordError,
    setShowModal,
    handlePasswordSubmit,
    handlePasswordChange,
    handleModalClose,
  };
}

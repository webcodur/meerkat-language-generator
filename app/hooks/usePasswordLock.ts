import { useState } from 'react';

/**
 * 비밀번호 잠금 기능을 관리하는 커스텀 훅
 * 특정 컴포넌트나 기능에 대한 접근을 비밀번호로 제어합니다.
 * @returns {Object} 잠금 상태 관리를 위한 상태값들과 핸들러 함수들
 */
export default function usePasswordLock() {
	// 현재 잠금 상태를 관리 (true: 잠김, false: 열림)
	const [isLocked, setIsLocked] = useState(true);

	// 비밀번호 입력 모달의 표시 상태
	const [showModal, setShowModal] = useState(false);

	// 사용자가 입력한 비밀번호 값
	const [password, setPassword] = useState('');

	// 비밀번호 오류 상태 (잘못된 비밀번호 입력 시 true)
	const [passwordError, setPasswordError] = useState(false);

	/**
	 * 비밀번호 제출 처리 함수
	 * 입력된 비밀번호가 'meerkat'과 일치하는지 확인하고
	 * 일치하면 잠금을 해제하고, 불일치하면 에러 상태를 설정
	 */
	const handlePasswordSubmit = () => {
		if (password === 'meerkat') {
			setIsLocked(false);
			setShowModal(false);
			setPassword('');
			setPasswordError(false);
		} else {
			setPasswordError(true);
		}
	};

	/**
	 * 비밀번호 입력값 변경 처리 함수
	 * @param value - 새로 입력된 비밀번호 값
	 */
	const handlePasswordChange = (value: string) => {
		setPassword(value);
		setPasswordError(false);
	};

	/**
	 * 모달 닫기 처리 함수
	 * 모달을 닫고 비밀번호 입력값과 에러 상태를 초기화
	 */
	const handleModalClose = () => {
		setShowModal(false);
		setPassword('');
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

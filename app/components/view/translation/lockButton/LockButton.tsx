import { FaLock, FaLockOpen, FaArrowUp } from 'react-icons/fa';

/**
 * LockButton 컴포넌트의 props 인터페이스
 * @interface LockButtonProps
 * @property {boolean} isLocked - 잠금 상태를 나타내는 불리언 값
 * @property {() => void} onShowModal - 모달을 표시하는 콜백 함수
 */
interface LockButtonProps {
	isLocked: boolean;
	onShowModal: () => void;
}

/**
 * 잠금/잠금해제 상태를 토글하는 버튼 컴포넌트
 * @param {LockButtonProps} props - 컴포넌트 props
 * @returns {JSX.Element} - 렌더링된 버튼 요소
 *
 * @description
 * - 화면 우측 하단에 고정된 둥근 버튼으로 표시됨
 * - isLocked 상태에 따라 다른 아이콘을 보여줌
 * - 클릭 시 onShowModal 콜백 함수를 실행
 * - 호버 시 배경색이 약간 어두워지는 효과 적용
 */
export default function LockButton({ isLocked, onShowModal }: LockButtonProps) {
	const buttonClass =
		'fixed w-12 h-12 flex items-center justify-center text-white bg-gray-700 rounded-full hover:bg-gray-600 z-[120]';

	const handleLockClick = () => {
		if (!isLocked) {
			alert('이미 잠금이 해제되어 있습니다.');
			return;
		}
		onShowModal();
	};

	return (
		<>
			<button
				onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
				className={`${buttonClass} bottom-10 right-[80px]`}
			>
				<FaArrowUp className="w-5 h-5" />
			</button>
			<button onClick={handleLockClick} className={`${buttonClass} bottom-10 right-6`}>
				{isLocked ? <FaLock className="w-5 h-5" /> : <FaLockOpen className="w-5 h-5" />}
			</button>
		</>
	);
}

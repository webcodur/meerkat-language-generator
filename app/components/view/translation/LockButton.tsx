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
	return (
		<button
			onClick={onShowModal}
			className="fixed z-40 p-3 text-white bg-gray-700 rounded-full bottom-20 right-6 hover:bg-gray-800"
		>
			{/* 잠금 상태일 때 표시되는 잠긴 자물쇠 아이콘 */}
			{isLocked ? (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="w-6 h-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
					/>
				</svg>
			) : (
				/* 잠금 해제 상태일 때 표시되는 열린 자물쇠 아이콘 */
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="w-6 h-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
					/>
				</svg>
			)}
		</button>
	);
}

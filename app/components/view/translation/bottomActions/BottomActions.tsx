import { Translation } from '@/app/types/translate'; // 번역 타입
import { saveTranslations } from '@/app/actions/translationActions'; // 번역 데이터 저장을 위한 액션
import JsonDownLoader from './jsonDownLoader/JsonDownLoader';
import { FaPlus, FaDatabase, FaUndo } from 'react-icons/fa';

// 컴포넌트 props 인터페이스 정의
interface BottomActionsProps {
	onDuplicate: () => void; // 행 복제 핸들러 함수
	isLocked: boolean; // 편집 잠금 상태
	disableActions: boolean; // 액션 비활성화 상태
	rows: Translation[]; // 번역 데이터 배열
	onClearSelection?: () => void; // 선택 해제 핸들러 함수
}

export default function BottomActions({
	onDuplicate,
	isLocked,
	disableActions,
	rows,
	onClearSelection,
}: BottomActionsProps) {
	const buttonClass =
		'px-6 py-2 text-white rounded flex items-center justify-center gap-2 text-sm font-medium transition-colors duration-200';

	// 번역 데이터 저장 핸들러
	const handleSave = async () => {
		// 빈 영문 키값 체크
		const hasEmptyKeys = rows.some((row) => !row.englishKey.trim());
		if (hasEmptyKeys) {
			alert('모든 행의 영문 키값을 입력해주세요.');
			return;
		}

		// 각 언어별 데이터 객체 생성
		const arTranslations: Record<string, string> = {};
		const koTranslations: Record<string, string> = {};
		const enTranslations: Record<string, string> = {};
		const verifiedStates: Record<string, boolean> = {};
		const descriptions: Record<string, string> = {};

		// 각 행의 데이터를 언어별 객체에 매핑
		rows.forEach((row) => {
			if (row.englishKey) {
				const key = row.englishKey;
				arTranslations[key] = row.arabicTranslation;
				koTranslations[key] = row.koreanWord;
				enTranslations[key] = row.englishTranslation;
				verifiedStates[key] = row.isVerified;
				descriptions[key] = row.koreanDescription || '';
			}
		});

		try {
			// 번역 데이터 저장 API 호출
			await saveTranslations({
				ko: koTranslations,
				en: enTranslations,
				ar: arTranslations,
				isVerified: verifiedStates,
				descriptions,
			});
			alert('번역이 성공적으로 저장되었습니다.');
		} catch (error) {
			console.error('번역 저장 중 오류 발생:', error);
			alert('번역 저장 중 오류가 발생했습니다.');
		}
	};

	// 하단 고정 액션 버튼 UI 렌더링
	return (
		<div className="fixed bottom-0 left-0 right-0 py-4 bg-white border-t z-[100]">
			<div className="px-6 mx-auto max-w-7xl">
				<div className="flex flex-col space-y-4">
					<div className="flex justify-center space-x-4">
						<button
							type="button"
							onClick={onClearSelection}
							disabled={!disableActions}
							className={`${buttonClass}
								${!disableActions ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'}`}
						>
							<FaUndo className="w-4 h-4" />
							선택해제
						</button>

						<button
							type="button"
							onClick={onDuplicate}
							disabled={disableActions}
							className={`${buttonClass}
								${disableActions ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
						>
							<FaPlus className="w-4 h-4" />행 추가
						</button>

						<button
							type="button"
							onClick={handleSave}
							disabled={isLocked}
							className={`${buttonClass} ${
								isLocked
									? 'bg-gray-400 cursor-not-allowed'
									: 'bg-blue-500 hover:bg-blue-600'
							}`}
						>
							<FaDatabase className="w-4 h-4" />
							DB저장
						</button>
					</div>

					<JsonDownLoader rows={rows} />
				</div>
			</div>
		</div>
	);
}

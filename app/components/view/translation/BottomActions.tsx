// 번역 데이터 저장을 위한 액션 import
import { saveTranslations } from '@/app/actions/translationActions';
// 번역 타입 정의 import
import { Translation } from '@/app/types/translate';

// 컴포넌트 props 인터페이스 정의
interface BottomActionsProps {
	onDuplicate: () => void; // 행 복제 핸들러 함수
	isLocked: boolean; // 편집 잠금 상태
	disableActions: boolean; // 액션 비활성화 상태
	rows: Translation[]; // 번역 데이터 배열
}

export default function BottomActions({
	onDuplicate,
	isLocked,
	disableActions,
	rows,
}: BottomActionsProps) {
	// 번역 데이터 저장 핸들러
	const handleSave = async () => {
		// 빈 영문 키값 체크
		const hasEmptyKeys = rows.some((row) => !row.englishKey.trim());
		if (hasEmptyKeys) {
			alert('모든 행의 영문 키값을 입력해주세요.');
			return;
		}

		// 각 언어별 데이터 객체 생성
		const arTranslations: Record<string, string> = {}; // 아랍어 번역
		const koTranslations: Record<string, string> = {}; // 한국어 번역
		const enTranslations: Record<string, string> = {}; // 영어 번역
		const verifiedStates: Record<string, boolean> = {}; // 검증 상태
		const descriptions: Record<string, string> = {}; // 한국어 설명

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

	// JSON 파일 다운로드 핸들러
	const handleDownload = (type: 'ko' | 'en' | 'ar') => {
		const translations: Record<string, string> = {};

		// 선택된 언어의 번역 데이터만 추출
		rows.forEach((row) => {
			if (row.englishKey) {
				switch (type) {
					case 'ko':
						translations[row.englishKey] = row.koreanWord;
						break;
					case 'en':
						translations[row.englishKey] = row.englishTranslation;
						break;
					case 'ar':
						translations[row.englishKey] = row.arabicTranslation;
						break;
				}
			}
		});

		// JSON 파일 생성 및 다운로드
		const blob = new Blob([JSON.stringify(translations, null, 2)], {
			type: 'application/json',
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${type}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	// 하단 고정 액션 버튼 UI 렌더링
	return (
		<div className="fixed bottom-0 left-0 right-0 py-4 bg-white border-t">
			<div className="px-6 mx-auto max-w-7xl">
				<div className="flex justify-center space-x-4">
					{/* 행 추가 버튼 */}
					<button
						type="button"
						onClick={onDuplicate}
						disabled={disableActions}
						className={`px-6 py-2 text-white rounded
              ${disableActions ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
					>
						+ 행 추가
					</button>
					{/* DB 저장 버튼 */}
					<button
						type="button"
						onClick={handleSave}
						disabled={isLocked}
						className={`px-6 py-2 text-white rounded ${
							isLocked
								? 'bg-gray-400 cursor-not-allowed'
								: 'bg-blue-500 hover:bg-blue-600'
						}`}
					>
						DB저장 (gist)
					</button>
					{/* 구분선 */}
					<div className="w-px h-6 my-auto bg-gray-300"></div>
					{/* 각 언어별 JSON 다운로드 버튼 */}
					<button
						type="button"
						onClick={() => handleDownload('ko')}
						className="px-6 py-2 text-white bg-purple-500 rounded hover:bg-purple-600"
					>
						ko.json
					</button>
					<button
						type="button"
						onClick={() => handleDownload('en')}
						className="px-6 py-2 text-white bg-purple-500 rounded hover:bg-purple-600"
					>
						en.json
					</button>
					<button
						type="button"
						onClick={() => handleDownload('ar')}
						className="px-6 py-2 text-white bg-purple-500 rounded hover:bg-purple-600"
					>
						ar.json
					</button>
				</div>
			</div>
		</div>
	);
}

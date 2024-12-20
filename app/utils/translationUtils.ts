import { Translation } from '@/app/types/translate';

/**
 * textarea 요소의 높이를 내용에 맞게 자동으로 조절하는 함수
 *
 * @param element - 높이를 조절할 textarea 요소
 *
 * 동작 방식:
 * 1. requestAnimationFrame을 사용하여 브라우저의 다음 리페인트 시점에 실행
 * 2. 요소의 높이를 먼저 'auto'로 설정하여 초기화
 * 3. scrollHeight 값을 사용하여 실제 컨텐츠 높이로 설정
 * 4. 부드러운 리사이징을 위해 애니메이션 프레임 사용
 */
export const adjustHeight = (element: HTMLTextAreaElement) => {
	requestAnimationFrame(() => {
		element.style.height = 'auto';
		element.style.height = `${element.scrollHeight}px`;
	});
};

/**
 * 페이지 내의 모든 textarea 요소의 높이를 자동으로 조절하는 함수
 *
 * 동작 방식:
 * 1. document.querySelectorAll을 사용하여 페이지 내 모든 textarea 요소 선택
 * 2. 각 textarea에 대해 adjustHeight 함수를 호출하여 개별적으로 높이 조절
 * 3. 타입 안전성을 위해 HTMLTextAreaElement로 타입 캐스팅
 */
export const adjustAllTextareas = () => {
	document.querySelectorAll('textarea').forEach((textarea) => {
		adjustHeight(textarea as HTMLTextAreaElement);
	});
};

/**
 * 행의 스타일을 계산하는 함수
 * 드래그 앤 드롭 인터페이스에서 행 이동 시 애니메이션 효과를 위한 스타일 계산
 *
 * @param index - 현재 행의 인덱스
 * @param selectedRows - 선택된 행들의 인덱스 배열
 * @param previewMove - 이동 미리보기 정보 (fromIndex: 시작 위치, toIndex: 목표 위치)
 * @returns 행에 적용될 스타일 객체
 *
 * 동작 방식:
 * 1. 미리보기 이동이 없는 경우 기본 스타일 반환
 * 2. 선택된 행들의 범위 계산 (최소, 최대 인덱스)
 * 3. 선택된 행들의 스타일 계산
 *    - 목표 위치가 없는 경우: 기본 선택 스타일 적용
 *    - 목표 위치가 있는 경우: 이동 거리에 따른 transform 스타일 계산
 * 4. 선택되지 않은 행들의 스타일 계산
 *    - 위로 이동 시: 영향받는 행들을 아래로 이동
 *    - 아래로 이동 시: 영향받는 행들을 위로 이동
 * 5. zIndex를 사용하여 드래그 시 레이어 순서 관리
 */
export const getRowStyle = (
	index: number,
	selectedRows: number[],
	previewMove: { fromIndex: number; toIndex: number | null } | null
) => {
	// 미리보기 이동이 없는 경우 빈 스타일 객체 반환
	if (!previewMove) return {};

	const { toIndex } = previewMove;
	const minSelected = Math.min(...selectedRows);
	const maxSelected = Math.max(...selectedRows);
	const selectedCount = maxSelected - minSelected + 1;

	// 선택된 행들의 스타일 계산
	if (index >= minSelected && index <= maxSelected) {
		// 목표 위치가 없는 경우의 스타일
		if (toIndex === null) {
			return {
				transform: 'translateY(0)',
				transition: 'transform 0.2s ease-out',
				backgroundColor: 'rgba(59, 130, 246, 0.1)',
				zIndex: 20,
			};
		}

		// 이동 거리 계산
		let moveDistance = 0;
		if (toIndex > maxSelected) {
			moveDistance = toIndex - maxSelected;
		} else if (toIndex < minSelected) {
			moveDistance = toIndex - minSelected;
		}

		return {
			transform: `translateY(${moveDistance * 100}%)`,
			transition: 'transform 0.15s ease-out',
			backgroundColor: 'rgba(59, 130, 246, 0.1)',
			zIndex: 20,
		};
	}
	// 선택되지 않은 행들의 스타일 계산
	else if (toIndex !== null) {
		// 선택된 행들이 위로 이동할 때 영향받는 행들의 스타일
		if (toIndex > maxSelected && index > maxSelected && index <= toIndex) {
			return {
				transform: `translateY(-${selectedCount * 100}%)`,
				transition: 'transform 0.15s ease-out',
				zIndex: 10,
			};
		}
		// 선택된 행들이 아래로 이동할 때 영향받는 행들의 스타일
		else if (
			toIndex < minSelected &&
			index >= toIndex &&
			index < minSelected
		) {
			return {
				transform: `translateY(${selectedCount * 100}%)`,
				transition: 'transform 0.15s ease-out',
				zIndex: 10,
			};
		}
	}

	// 기본 스타일 반환
	return {
		transform: 'translateY(0)',
		transition: 'transform 0.2s ease-out',
	};
};

/**
 * 번역 데이터를 처리하여 Translation 배열로 변환하는 함수
 * 다국어 번역 데이터를 일관된 형식의 객체 배열로 변환
 *
 * @param translationData - 처리할 번역 데이터 객체
 * @returns Translation 객체의 배열
 *
 * 동작 방식:
 * 1. 빈 Translation 배열 초기화
 * 2. 한국어 데이터를 기준으로 첫 번째 순회
 *    - 각 키에 대해 Translation 객체 생성
 *    - 해당하는 모든 언어의 번역과 설명을 포함
 * 3. 영어 데이터 추가 순회
 *    - 한국어에 없는 키를 찾아 새로운 Translation 객체 생성
 *    - 누락된 번역 데이터 처리
 * 4. 각 Translation 객체는 다음 정보 포함:
 *    - koreanWord: 한국어 단어
 *    - koreanDescription: 한국어 설명
 *    - englishKey: 영어 키값
 *    - englishTranslation: 영어 번역
 *    - arabicTranslation: 아랍어 번역
 *    - isVerified: 검증 상태
 */
export const processTranslationData = (translationData: any): Translation[] => {
	const existingRows: Translation[] = [];

	// 한국어 데이터의 키를 기준으로 Translation 객체 생성
	Object.keys(translationData.ko).forEach((key) => {
		existingRows.push({
			koreanWord: translationData.ko[key] || '',
			koreanDescription: translationData.descriptions[key] || '',
			englishKey: key,
			englishTranslation: translationData.en[key] || '',
			arabicTranslation: translationData.ar[key] || '',
			isVerified: translationData.isVerified?.[key] || false,
		});
	});

	// 영어 데이터에만 존재하는 키에 대한 Translation 객체 생성
	Object.keys(translationData.en).forEach((key) => {
		if (!existingRows.find((row) => row.englishKey === key)) {
			existingRows.push({
				koreanWord: translationData.ko[key] || '',
				koreanDescription: translationData.descriptions[key] || '',
				englishKey: key,
				englishTranslation: translationData.en[key] || '',
				arabicTranslation: translationData.ar[key] || '',
				isVerified: translationData.isVerified?.[key] || false,
			});
		}
	});

	return existingRows;
};

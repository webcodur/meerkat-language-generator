import { useState, useEffect } from 'react';
import { Translation } from '@/app/types/translate';
import { generateTranslations, loadTranslations } from '../actions/translationActions';
import { adjustAllTextareas, processTranslationData, getRowStyle } from '../utils/translationUtils';

/**
 * 번역 폼을 관리하는 커스텀 훅
 * 번역 데이터의 CRUD 작업과 UI 상태를 관리합니다.
 * @returns {object} 번역 폼 관련 상태와 핸들러 함수들
 */
export default function useTranslationForm() {
	// 번역 데이터 행들을 관리하는 상태
	const [rows, setRows] = useState<Translation[]>([
		{
			koreanWord: '',
			koreanDescription: '',
			englishKey: '',
			englishTranslation: '',
			arabicTranslation: '',
			isVerified: false,
		},
	]);

	// 각 행별 로딩 상태
	const [loadingRows, setLoadingRows] = useState<{ [key: number]: boolean }>({});
	// 전체 데이터 로딩 상태
	const [isLoading, setIsLoading] = useState(true);
	// 에러 메시지 상태
	const [error, setError] = useState<string | null>(null);
	// 선택된 행들의 인덱스 배열
	const [selectedRows, setSelectedRows] = useState<number[]>([]);
	// 행 이동 미리보기 상태: 출발지 인덱스 & 목적지 인덱스
	const [previewMove, setPreviewMove] = useState<{
		fromIndex: number;
		toIndex: number | null;
	} | null>(null);

	// 선택 행이 없을 때 previewMove 초기화
	useEffect(() => {
		if (selectedRows.length === 0) {
			setPreviewMove(null);
		}
	}, [selectedRows]);

	// useEffect(() => {
	// 	console.log('previewMove', previewMove?.fromIndex, previewMove?.toIndex);
	// }, [previewMove]);

	// 서버에서 번역 데이터 로드
	const loadTranslationData = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const translationData = await loadTranslations();
			const existingRows = processTranslationData(translationData);

			// 데이터가 없는 경우 빈 행 추가
			if (existingRows.length === 0) {
				existingRows.push({
					koreanWord: '',
					koreanDescription: '',
					englishKey: '',
					englishTranslation: '',
					arabicTranslation: '',
					isVerified: false,
				});
			}

			setRows(existingRows);
		} catch (error) {
			console.error('번역 데이터 로드 중 오류 발생:', error);
			setError('번역 데이터를 불러오는데 실패했습니다.');
		} finally {
			setIsLoading(false);
		}
	};

	// 행 번역
	const handleSubmit = async (index: number) => {
		const koreanWord = rows[index].koreanWord;
		const koreanDescription = rows[index].koreanDescription;

		setLoadingRows((prev) => ({ ...prev, [index]: true }));

		try {
			const response = await generateTranslations({
				ko: koreanWord,
				description: koreanDescription || undefined,
			});

			const newRows = [...rows];
			newRows[index] = {
				...newRows[index],
				englishKey: response.englishKey,
				englishTranslation: response.en,
				arabicTranslation: response.ar,
			};
			setRows(newRows);
		} catch (error) {
			console.error('번역 생성 중 오류 발생:', error);
			alert('번역 생성 중 오류가 발생했습니다.');
		} finally {
			setLoadingRows((prev) => ({ ...prev, [index]: false }));
		}
	};

	// 행 추가 * 행이 선택되어 있지 않을 때만 동작
	const handleDuplicate = () => {
		if (selectedRows.length > 0) return;

		const emptyRow: Translation = {
			koreanWord: '',
			koreanDescription: '',
			englishKey: '',
			englishTranslation: '',
			arabicTranslation: '',
			isVerified: false,
		};
		setRows([...rows, emptyRow]);
	};

	// 행 삭제 * 검수된 행은 삭제할 수 없으며, 최소 1개 행은 유지
	const handleDelete = (index: number) => {
		if (selectedRows.length > 0) return;

		if (rows[index].isVerified) {
			alert('검수된 행은 삭제할 수 없습니다.');
			return;
		}

		if (rows.length > 1) {
			setRows(rows.filter((_, i) => i !== index));
		}
	};

	// 블록 이동: 드래그 핸들러 도착 시 블록 체크를 모두 해제 & 드래그 핸들러 초기화
	const handleMoveRows = () => {
		// 미리보기 상태가 없거나 목적지가 없으면 종료
		if (!previewMove || previewMove.toIndex === null) return;

		// 선택된 행들을 새 위치로 이동
		const newRows = [...rows];
		const selectedRowsData = selectedRows.map((index) => newRows[index]);
		const remainingRows = newRows.filter((_, index) => !selectedRows.includes(index));

		remainingRows.splice(previewMove.toIndex, 0, ...selectedRowsData);

		// 상태 업데이트
		setRows(remainingRows);
		// 선택된 행들과 미리보기 상태 초기화
		setSelectedRows([]);
		setPreviewMove(null);
	};

	// textarea 높이 자동 조절을 위한 이펙트
	useEffect(() => {
		adjustAllTextareas();
	}, [rows]);

	// 컴포넌트 마운트 시 데이터 로드
	useEffect(() => {
		loadTranslationData();
	}, []);

	return {
		rows,
		loadingRows,
		isLoading,
		error,
		selectedRows,
		previewMove,
		loadTranslationData,
		handleSubmit,
		handleDuplicate,
		handleDelete,
		setRows,
		setSelectedRows,
		setPreviewMove,
		getRowStyle: (index: number) => getRowStyle(index, selectedRows, previewMove),
		handleMoveRows,
	};
}

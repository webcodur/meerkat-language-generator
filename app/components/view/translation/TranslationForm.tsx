'use client';
import React, { useState, useEffect } from 'react';
import { Translation } from '../../../types';
import { generateTranslations, saveTranslations, loadTranslations } from '../../../actions/translationActions';

import ModelInfo from '@/app/components/view/translation/ModelInfo';
import LockButton from '@/app/components/view/translation/LockButton';
import PasswordModal from '@/app/components/view/translation/PasswordModal';
import TableHeader from '@/app/components/view/translation/TableHeader';
import BottomActions from '@/app/components/view/translation/BottomActions';
import TranslationRow from '@/app/components/view/translation/TranslationRow';

export default function TranslationForm() {
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

	// 상단에 loading 상태 추가
	const [loadingRows, setLoadingRows] = useState<{ [key: number]: boolean }>({});
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// 락 상태와 모달 상태 추가
	const [isLocked, setIsLocked] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [password, setPassword] = useState('');
	const [passwordError, setPasswordError] = useState(false);

	// 함수 이름을 loadTranslationData로 변경
	const loadTranslationData = async () => {
		setIsLoading(true);
		setError(null);
		
		try {
            const translationData = await loadTranslations();
			const existingRows: Translation[] = [];
			
			// 한국어 데이터의 키를 기준으로 매핑
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

			// 영어 데이터에만 있는 키 확인
			Object.keys(translationData.en).forEach((key) => {
				if (!existingRows.find(row => row.englishKey === key)) {
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

	// useEffect에서도 함수 이름 변경
	useEffect(() => {
		loadTranslationData();
	}, []);

	// 새로고침 핸들러 수정
	const handleRefresh = () => {
		loadTranslationData();
	};

	async function handleSubmit(index: number) {
		const koreanWord = rows[index].koreanWord;
		const koreanDescription = rows[index].koreanDescription;

		// 로딩 상태 설정
		setLoadingRows(prev => ({ ...prev, [index]: true }));

		try {
			// OpenAI API를 통해 번역 데이터 생성
			const response = await generateTranslations({
				ko: koreanWord,
					description: koreanDescription || undefined
			});

			// 응답 데이터로 행 업데이트
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
			// 로딩 상태 해제
			setLoadingRows(prev => ({ ...prev, [index]: false }));
		}
	}

	const handleDuplicate = () => {
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

	const handleDelete = (index: number) => {
		// 검수된 행은 삭제할 수 없음
		if (rows[index].isVerified) {
			alert('검수된 행은 삭제할 수 없습니다.');
			return;
		}
		
		if (rows.length > 1) {
			// 최소 1개 행은 유지
			setRows(rows.filter((_, i) => i !== index));
		}
	};

	const handleSave = async () => {
		const hasEmptyKeys = rows.some(row => !row.englishKey.trim());
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
		
		rows.forEach(row => {
			if (row.englishKey) {
				const key = row.englishKey;
				arTranslations[key] = row.arabicTranslation;
				koTranslations[key] = row.koreanWord;
				enTranslations[key] = row.englishTranslation;
				verifiedStates[key] = row.isVerified;
				descriptions[key] = row.koreanDescription || "";
			}
		});

		try {
			await saveTranslations({
				ko: koTranslations,
				en: enTranslations,
				ar: arTranslations,
				isVerified: verifiedStates,
				descriptions
			});
			alert('번역이 성공적으로 저장되었습니다.');
		} catch (error) {
			console.error('번역 저장 중 오류 발생:', error);
			alert('번역 저장 중 오류가 발생했습니다.');
		}
	};

	// adjustHeight 함수 수정
	const adjustHeight = (element: HTMLTextAreaElement) => {
		requestAnimationFrame(() => {
			element.style.height = 'auto';
			element.style.height = `${element.scrollHeight}px`;
		});
	};

	// 모든 textarea의 높이를 조절하는 함수
	const adjustAllTextareas = () => {
		document.querySelectorAll('textarea').forEach((textarea) => {
			adjustHeight(textarea as HTMLTextAreaElement);
		});
	};

	// 초기 렌더링과 rows 변경 시 높이 조절
	useEffect(() => {
		adjustAllTextareas();
	}, [rows]);

	// handleDownload 함수를 컴포넌트 내에 추가
	const handleDownload = (type: 'ko' | 'en' | 'ar') => {
		const translations: Record<string, string> = {};
		
		rows.forEach(row => {
			if (row.englishKey) {
				switch(type) {
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

		const blob = new Blob([JSON.stringify(translations, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${type}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	// 비밀번호 확인 함수
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

	// 모밀번호 관련 핸들러 수정
	const handlePasswordChange = (value: string) => {
		setPassword(value);
		setPasswordError(false);
	};

	const handleModalClose = () => {
		setShowModal(false);
		setPassword('');
		setPasswordError(false);
	};

	// handleRowUpdate 함수 추가
	const handleRowUpdate = (index: number, updatedRow: Translation) => {
		const newRows = [...rows];
		newRows[index] = updatedRow;
		setRows(newRows);
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<div className="inline-block w-8 h-8 mb-4 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
					<p className="text-gray-600">번역 파일 로딩중...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<p className="mb-4 text-red-500">{error}</p>
					<button
						onClick={handleRefresh}
						className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
					>
						새로고침
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-7xl">
			<div className="relative p-6 pb-20 border rounded-lg">
				<ModelInfo model={'gpt-4o-mini'} />

				<TableHeader />

				{rows.map((row, index) => (
					<TranslationRow
						key={index}
						row={row}
						index={index}
						loadingRows={loadingRows}
						onUpdate={handleRowUpdate}
						onSubmit={handleSubmit}
						onDelete={handleDelete}
					/>
				))}

				<BottomActions 
					onDuplicate={handleDuplicate}
					onRefresh={handleRefresh}
					onSave={handleSave}
					onDownload={handleDownload}
					isLocked={isLocked}
				/>

				<LockButton 
					isLocked={isLocked} 
					onShowModal={() => setShowModal(true)} 
				/>
				{showModal && (
					<PasswordModal
						password={password}
						passwordError={passwordError}
						onPasswordChange={handlePasswordChange}
						onSubmit={handlePasswordSubmit}
						onClose={handleModalClose}
					/>
				)}
			</div>
		</div>
	);
}

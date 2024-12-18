'use client';
import React, { useState, useEffect } from 'react';
import { Translation } from '../types';
import { generateTranslations, saveTranslations, loadTranslations } from '../actions/translationActions';

export default function TranslationForm() {
	// 컬럼 너비 상수 정의
	const COLUMN_WIDTHS = {
		number: 'w-[60px]',
		koreanWord: 'w-[180px]',
		koreanDesc: 'w-[200px]',
		button: 'w-[90px]',
		englishKey: 'w-[150px]',
		translation: 'w-[180px]',
	} as const;

	const [rows, setRows] = useState<Translation[]>([
		// 초기 빈 행 하나를 기본으로 생성
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

	// 상단에 모델명 상태 추가
	const [gptModel, setGptModel] = useState<string>('');

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
			const [translationData, modelInfo] = await Promise.all([
				loadTranslations(), // 서버 액션
				fetch('/api/translate/model').then(res => res.json())
			]);

			setGptModel(modelInfo.model);

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

	const inputClassName =
		'p-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none';

	// 헤더 행의 스타일 클래스 통일
	const headerCellClass = "text-center flex items-center justify-center text-sm font-medium text-gray-700";

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
		if (password === '123') {
			setIsLocked(false);
			setShowModal(false);
			setPassword('');
			setPasswordError(false);
		} else {
			setPasswordError(true);
		}
	};

	// 모달 컴포넌트
	const PasswordModal = () => (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
			<div className="p-6 bg-white rounded-lg w-80">
				<h3 className="mb-4 text-lg font-medium">비밀번호 입력</h3>
				<input
					type="password"
					value={password}
					onChange={(e) => {
						setPassword(e.target.value);
						setPasswordError(false);
					}}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							handlePasswordSubmit();
						}
						if (e.key === 'Escape') {
							setShowModal(false);
							setPassword('');
							setPasswordError(false);
						}
					}}
					autoFocus
					className="w-full p-2 mb-4 border rounded"
					placeholder="비밀번호를 입력하세요"
				/>
				{passwordError && (
					<p className="mb-4 text-sm text-red-500">잘못된 비밀번호입니다</p>
				)}
				<div className="flex justify-end space-x-2">
					<button
						onClick={() => {
							setShowModal(false);
							setPassword('');
							setPasswordError(false);
						}}
						className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
					>
						취소
					</button>
					<button
						onClick={handlePasswordSubmit}
						className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
					>
						확인
					</button>
				</div>
			</div>
		</div>
	);

	// 락 버튼 컴포넌트
	const LockButton = () => (
		<button
			onClick={() => setShowModal(true)}
			className="fixed z-40 p-3 text-white bg-gray-700 rounded-full bottom-20 right-6 hover:bg-gray-800"
		>
			{isLocked ? (
				<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
				</svg>
			) : (
				<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
				</svg>
			)}
		</button>
	);

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
				{/* GPT 모델 정보 추가 */}
				<div className="mb-6 text-center">
					<p className="text-sm text-gray-500">
						Powered by OpenAI
						<span className="inline-flex items-center justify-center px-2 py-1 ml-2 text-xs font-medium text-green-700 bg-green-100 rounded-full">
							{gptModel || 'Loading...'}
						</span>
					</p>
				</div>

				{/* 헤더 행 */}
				<div className="flex pb-2 space-x-2 border-b">
					<div className={`${COLUMN_WIDTHS.number} ${headerCellClass}`}>번호</div>
					<div className={`${COLUMN_WIDTHS.koreanWord} ${headerCellClass}`}>한국어 단어 *</div>
					<div className={`${COLUMN_WIDTHS.koreanDesc} ${headerCellClass}`}>한국어 설명</div>
					<div className={`${COLUMN_WIDTHS.button} ${headerCellClass}`}>생성</div>
					<div className={`${COLUMN_WIDTHS.englishKey} ${headerCellClass}`}>영문 키값</div>
					<div className={`${COLUMN_WIDTHS.translation} ${headerCellClass}`}>영어</div>
					<div className={`${COLUMN_WIDTHS.translation} ${headerCellClass}`}>아랍어</div>
					<div className={`${COLUMN_WIDTHS.button} ${headerCellClass}`}>검수</div>
					<div className={`${COLUMN_WIDTHS.number} ${headerCellClass}`}>제거</div>
				</div>

				{/* 모든 행 렌더링 */}
				{rows.map((row, index) => (
					<div
						key={index}
						className="flex items-center space-x-2 py-2 border-b min-h-[42px]">
						<div
							className={`${COLUMN_WIDTHS.number} flex items-center justify-center`}>
							{index + 1}
						</div>
						<textarea
							value={row.koreanWord}
							onChange={(e) => {
								const newRows = [...rows];
								newRows[index] = { ...row, koreanWord: e.target.value };
								setRows(newRows);
							}}
							className={`${COLUMN_WIDTHS.koreanWord} ${inputClassName} overflow-hidden resize-none min-h-[38px]`}
							rows={1}
						/>
						<textarea
							value={row.koreanDescription}
							onChange={(e) => {
								const newRows = [...rows];
								newRows[index] = { ...row, koreanDescription: e.target.value };
								setRows(newRows);
							}}
							className={`${COLUMN_WIDTHS.koreanDesc} ${inputClassName} overflow-hidden resize-none min-h-[38px]`}
							rows={1}
						/>
						<button
							type="button"
							onClick={() => handleSubmit(index)}
							disabled={loadingRows[index] || row.isVerified}
							className={`${COLUMN_WIDTHS.button} h-[38px] text-sm text-white 
								${loadingRows[index] || row.isVerified
									? 'bg-gray-400 cursor-not-allowed' 
									: 'bg-indigo-500 hover:bg-indigo-600'
								}`}>
							{loadingRows[index] ? '생성중...' : '생성'}
						</button>
						<input
							type="text"
							value={row.englishKey}
							onChange={(e) => {
								const newRows = [...rows];
								newRows[index] = { ...row, englishKey: e.target.value };
								setRows(newRows);
							}}
							disabled={row.isVerified}
							className={`${COLUMN_WIDTHS.englishKey} ${inputClassName} ${
								row.isVerified ? 'bg-gray-100 cursor-not-allowed' : ''
							}`}
						/>
						<input
							type="text"
							value={row.englishTranslation}
							onChange={(e) => {
								const newRows = [...rows];
								newRows[index] = { ...row, englishTranslation: e.target.value };
								setRows(newRows);
							}}
							disabled={row.isVerified}
							className={`${COLUMN_WIDTHS.translation} ${inputClassName} ${
								row.isVerified ? 'bg-gray-100 cursor-not-allowed' : ''
							}`}
						/>
						<input
							type="text"
							value={row.arabicTranslation}
							onChange={(e) => {
								const newRows = [...rows];
								newRows[index] = { ...row, arabicTranslation: e.target.value };
								setRows(newRows);
							}}
							disabled={row.isVerified}
							className={`${COLUMN_WIDTHS.translation} ${inputClassName} text-right dir-rtl ${
								row.isVerified ? 'bg-gray-100 cursor-not-allowed' : ''
							}`}
							dir="rtl"
						/>
						<div
							className={`${COLUMN_WIDTHS.button} flex items-center justify-center`}>
							<input
								type="checkbox"
								checked={row.isVerified}
								onChange={(e) => {
									const newRows = [...rows];
									newRows[index] = { ...row, isVerified: e.target.checked };
									setRows(newRows);
								}}
								className="w-6 h-6 text-blue-600 scale-125 border-2 border-gray-300 rounded cursor-pointer focus:ring-blue-500"
							/>
						</div>
						<div
							className={`${COLUMN_WIDTHS.number} flex items-center justify-center`}>
							<button
								onClick={() => handleDelete(index)}
								disabled={row.isVerified}
								className={`w-[38px] h-[38px] flex items-center justify-center text-white rounded text-lg
									${row.isVerified 
										? 'bg-gray-400 cursor-not-allowed' 
										: 'bg-red-500 hover:bg-red-600'
									}`}>
								-
							</button>
						</div>
					</div>
				))}

				{/* 하단 버튼 영역 수정 */}
				<div className="fixed bottom-0 left-0 right-0 py-4 bg-white border-t">
					<div className="px-6 mx-auto max-w-7xl">
						<div className="flex justify-center space-x-4">
							<button
								type="button"
								onClick={handleDuplicate}
								className="px-6 py-2 text-white bg-green-500 rounded hover:bg-green-600">
								+ 행 추가
							</button>
							<button
								type="button"
								onClick={handleRefresh}
								className="px-6 py-2 text-white bg-gray-500 rounded hover:bg-gray-600">
								새로고침
							</button>
							<button
								type="button"
								onClick={handleSave}
								disabled={isLocked}
								className={`px-6 py-2 text-white rounded ${
									isLocked 
										? 'bg-gray-400 cursor-not-allowed' 
										: 'bg-blue-500 hover:bg-blue-600'
								}`}>
								저장
							</button>
							<div className="w-px h-6 my-auto bg-gray-300"></div>
							<button
								type="button"
								onClick={() => handleDownload('ko')}
								className="px-6 py-2 text-white bg-purple-500 rounded hover:bg-purple-600">
								ko.json
							</button>
							<button
								type="button"
								onClick={() => handleDownload('en')}
								className="px-6 py-2 text-white bg-purple-500 rounded hover:bg-purple-600">
								en.json
							</button>
							<button
								type="button"
								onClick={() => handleDownload('ar')}
								className="px-6 py-2 text-white bg-purple-500 rounded hover:bg-purple-600">
								ar.json
							</button>
						</div>
					</div>
				</div>

				{/* 락 버튼과 모달 추가 */}
				<LockButton />
				{showModal && <PasswordModal />}
			</div>
		</div>
	);
}

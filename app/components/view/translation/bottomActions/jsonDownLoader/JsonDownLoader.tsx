import React from 'react';
import handleDownload from './handleDownload';
import { Translation } from '@/types/translate';
import { FiDownload } from 'react-icons/fi';

interface JsonDownLoaderProps {
	rows: Translation[];
}

const JsonDownLoader = ({ rows }: JsonDownLoaderProps) => {
	const downloadAll = async () => {
		const languages = ['ko', 'en', 'ar'];
		for (const lang of languages) {
			await handleDownload(rows, lang as 'ko' | 'en' | 'ar');
			await new Promise((resolve) => setTimeout(resolve, 500));
		}
	};

	const langMap = {
		ko: '한국어',
		en: '영어',
		ar: '아랍어',
	};

	const buttonBaseStyle =
		'w-[100px] p-2 text-white rounded flex items-center justify-center space-x-2 font-medium text-md';

	return (
		<div className="flex justify-center space-x-4">
			{/* 언어별 다운로드 */}
			{['ko', 'en', 'ar'].map((lang) => (
				<button
					key={lang}
					type="button"
					onClick={() => handleDownload(rows, lang as 'ko' | 'en' | 'ar')}
					className={`${buttonBaseStyle} bg-purple-500 hover:bg-purple-600`}
				>
					<FiDownload className="w-4 h-4" />
					<span>{langMap[lang]}</span>
				</button>
			))}

			{/* 전체 파일 다운로드 */}
			<button
				type="button"
				onClick={downloadAll}
				className={`${buttonBaseStyle} bg-green-500 hover:bg-green-600`}
			>
				<FiDownload className="w-4 h-4" />
				<span>전체</span>
			</button>
		</div>
	);
};

export default JsonDownLoader;

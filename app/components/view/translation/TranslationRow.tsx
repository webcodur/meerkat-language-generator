import React from 'react';
import { Translation } from '@/app/types/translate';
import { COLUMN_WIDTHS } from '../../../data/constants';

interface TranslationRowProps {
	row: Translation;
	index: number;
	loadingRows: { [key: number]: boolean };
	onUpdate: (index: number, updatedRow: Translation) => void;
	onSubmit: (index: number) => void;
	onDelete: (index: number) => void;
	selectedRows: number[];
	onRowSelect: (index: number, selected: boolean) => void;
	disableDelete: boolean;
}

export default function TranslationRow({
	row,
	index,
	loadingRows,
	onUpdate,
	onSubmit,
	onDelete,
	selectedRows,
	onRowSelect,
	disableDelete,
}: TranslationRowProps) {
	const inputStyle =
		'p-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none whitespace-nowrap';

	return (
		<div data-row-id={index} className="flex items-center space-x-2 py-2 border-b min-h-[42px]">
			<div className={`${COLUMN_WIDTHS.checkbox} flex items-center justify-center`}>
				<input
					type="checkbox"
					checked={selectedRows.includes(index)}
					onChange={(e) => onRowSelect(index, e.target.checked)}
					className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded cursor-pointer focus:ring-blue-500"
				/>
			</div>
			<div className={`${COLUMN_WIDTHS.number} flex items-center justify-center`}>
				{index + 1}
			</div>
			<textarea
				value={row.koreanWord}
				onChange={(e) => onUpdate(index, { ...row, koreanWord: e.target.value })}
				className={`${COLUMN_WIDTHS.koreanWord} ${inputStyle} resize-none min-h-[38px] overflow-hidden`}
				rows={1}
			/>
			<textarea
				value={row.koreanDescription}
				onChange={(e) =>
					onUpdate(index, {
						...row,
						koreanDescription: e.target.value,
					})
				}
				className={`${COLUMN_WIDTHS.koreanDesc} ${inputStyle} resize-none min-h-[38px] overflow-hidden`}
				rows={1}
			/>
			<button
				type="button"
				onClick={() => onSubmit(index)}
				disabled={loadingRows[index] || row.isVerified}
				className={`${COLUMN_WIDTHS.button} h-[38px] text-sm text-white 
          ${
				loadingRows[index] || row.isVerified
					? 'bg-gray-400 cursor-not-allowed'
					: 'bg-indigo-500 hover:bg-indigo-600'
			}`}
			>
				{loadingRows[index] ? '생성중...' : '생성'}
			</button>
			<input
				type="text"
				value={row.englishKey}
				onChange={(e) => onUpdate(index, { ...row, englishKey: e.target.value })}
				disabled={row.isVerified}
				className={`${COLUMN_WIDTHS.englishKey} ${inputStyle} ${
					row.isVerified ? 'bg-gray-100 cursor-not-allowed' : ''
				}`}
			/>
			<input
				type="text"
				value={row.englishTranslation}
				onChange={(e) =>
					onUpdate(index, {
						...row,
						englishTranslation: e.target.value,
					})
				}
				disabled={row.isVerified}
				className={`${COLUMN_WIDTHS.translation} ${inputStyle} ${
					row.isVerified ? 'bg-gray-100 cursor-not-allowed' : ''
				}`}
			/>
			<input
				type="text"
				value={row.arabicTranslation}
				onChange={(e) =>
					onUpdate(index, {
						...row,
						arabicTranslation: e.target.value,
					})
				}
				disabled={row.isVerified}
				className={`${COLUMN_WIDTHS.translation} ${inputStyle} text-right dir-rtl ${
					row.isVerified ? 'bg-gray-100 cursor-not-allowed' : ''
				}`}
				dir="rtl"
			/>
			<div className={`${COLUMN_WIDTHS.button} flex items-center justify-center`}>
				<input
					type="checkbox"
					checked={row.isVerified}
					onChange={(e) =>
						onUpdate(index, {
							...row,
							isVerified: e.target.checked,
						})
					}
					className="w-6 h-6 text-blue-600 scale-125 border-2 border-gray-300 rounded cursor-pointer focus:ring-blue-500"
				/>
			</div>
			<div className={`${COLUMN_WIDTHS.number} flex items-center justify-center`}>
				<button
					onClick={() => onDelete(index)}
					disabled={row.isVerified || disableDelete}
					className={`w-[38px] h-[38px] flex items-center justify-center text-white rounded text-lg
						${
							row.isVerified || disableDelete
								? 'bg-gray-400 cursor-not-allowed'
								: 'bg-red-500 hover:bg-red-600'
						}`}
				>
					-
				</button>
			</div>
		</div>
	);
}

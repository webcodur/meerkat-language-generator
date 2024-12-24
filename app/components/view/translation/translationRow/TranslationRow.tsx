import React from 'react';
import { Translation } from '@/types/translate';
import { COLUMN_WIDTHS } from '@/data/constant/columnWidths';
import { FaMinus } from 'react-icons/fa';

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

	const buttonClass =
		'h-[38px] flex items-center justify-center text-white rounded text-sm font-medium transition-colors duration-200';

	return (
		<div data-row-id={index} className="flex items-center space-x-2 py-2 border-b min-h-[42px]">
			<div
				className={`flex items-center justify-center`}
				style={{
					width: COLUMN_WIDTHS.checkbox,
					minWidth: COLUMN_WIDTHS.checkbox,
					maxWidth: COLUMN_WIDTHS.checkbox,
				}}
			>
				<input
					type="checkbox"
					checked={selectedRows.includes(index)}
					onChange={(e) => onRowSelect(index, e.target.checked)}
					className="w-5 h-5 text-primary-600 border-2 border-gray-300 rounded cursor-pointer focus:ring-primary-500"
				/>
			</div>
			<div
				className={`flex items-center justify-center`}
				style={{
					width: COLUMN_WIDTHS.number,
					minWidth: COLUMN_WIDTHS.number,
					maxWidth: COLUMN_WIDTHS.number,
				}}
			>
				{index + 1}
			</div>
			<textarea
				value={row.koreanWord}
				onChange={(e) => onUpdate(index, { ...row, koreanWord: e.target.value })}
				className={`${inputStyle} resize-none min-h-[38px] overflow-hidden`}
				style={{
					width: COLUMN_WIDTHS.koreanWord,
					minWidth: COLUMN_WIDTHS.koreanWord,
					maxWidth: COLUMN_WIDTHS.koreanWord,
				}}
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
				className={`${inputStyle} resize-none min-h-[38px] overflow-hidden`}
				style={{
					width: COLUMN_WIDTHS.koreanDesc,
					minWidth: COLUMN_WIDTHS.koreanDesc,
					maxWidth: COLUMN_WIDTHS.koreanDesc,
				}}
				rows={1}
			/>
			<button
				type="button"
				onClick={() => onSubmit(index)}
				disabled={loadingRows[index] || row.isVerified}
				className={`${buttonClass} ${
					loadingRows[index] || row.isVerified
						? 'bg-gray-400 cursor-not-allowed'
						: 'bg-primary-500 hover:bg-primary-600'
				}`}
				style={{
					width: COLUMN_WIDTHS.button,
					minWidth: COLUMN_WIDTHS.button,
					maxWidth: COLUMN_WIDTHS.button,
				}}
			>
				{loadingRows[index] ? '생성중...' : '생성'}
			</button>
			<input
				type="text"
				value={row.englishKey}
				onChange={(e) => onUpdate(index, { ...row, englishKey: e.target.value })}
				disabled={row.isVerified}
				className={`${inputStyle} ${
					row.isVerified ? 'bg-gray-100 cursor-not-allowed' : ''
				}`}
				style={{
					width: COLUMN_WIDTHS.englishKey,
					minWidth: COLUMN_WIDTHS.englishKey,
					maxWidth: COLUMN_WIDTHS.englishKey,
				}}
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
				className={`${inputStyle}`}
				style={{
					width: COLUMN_WIDTHS.translation,
					minWidth: COLUMN_WIDTHS.translation,
					maxWidth: COLUMN_WIDTHS.translation,
				}}
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
				className={`${inputStyle} text-right dir-rtl ${
					row.isVerified ? 'bg-gray-100 cursor-not-allowed' : ''
				}`}
				style={{
					width: COLUMN_WIDTHS.translation,
					minWidth: COLUMN_WIDTHS.translation,
					maxWidth: COLUMN_WIDTHS.translation,
				}}
				dir="rtl"
			/>
			<div
				className={`flex items-center justify-center`}
				style={{
					width: COLUMN_WIDTHS.button,
					minWidth: COLUMN_WIDTHS.button,
					maxWidth: COLUMN_WIDTHS.button,
				}}
			>
				<input
					type="checkbox"
					checked={row.isVerified}
					onChange={(e) =>
						onUpdate(index, {
							...row,
							isVerified: e.target.checked,
						})
					}
					className="w-6 h-6 text-primary-600 scale-125 border-2 border-gray-300 rounded cursor-pointer focus:ring-primary-500"
				/>
			</div>
			<div
				className={`flex items-center justify-center`}
				style={{
					width: COLUMN_WIDTHS.number,
					minWidth: COLUMN_WIDTHS.number,
					maxWidth: COLUMN_WIDTHS.number,
				}}
			>
				<button
					onClick={() => onDelete(index)}
					disabled={row.isVerified || disableDelete}
					className={`w-[38px] ${buttonClass} ${
						row.isVerified || disableDelete
							? 'bg-gray-400 cursor-not-allowed'
							: 'bg-red-500 hover:bg-red-600'
					}`}
				>
					<FaMinus className="w-3 h-3" />
				</button>
			</div>
		</div>
	);
}

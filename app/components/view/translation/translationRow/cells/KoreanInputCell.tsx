import { COLUMN_WIDTHS } from '@/data/constant/columnWidths';
import { Translation } from '@/types/translate';
import { commonInputStyle } from '../styles';

interface KoreanInputCellProps {
	row: Translation;
	index: number;
	onUpdate: (index: number, updatedRow: Translation) => void;
	type: 'word' | 'description';
}

export default function KoreanInputCell({ row, index, onUpdate, type }: KoreanInputCellProps) {
	const width = type === 'word' ? COLUMN_WIDTHS.koreanWord : COLUMN_WIDTHS.koreanDesc;
	const value = type === 'word' ? row.koreanWord : row.koreanDescription;

	return (
		<div
			className="flex items-center space-x-1"
			style={{
				width,
				minWidth: width,
				maxWidth: width,
			}}
		>
			<textarea
				value={value}
				onChange={(e) =>
					onUpdate(index, {
						...row,
						[type === 'word' ? 'koreanWord' : 'koreanDescription']: e.target.value,
					})
				}
				className={`${commonInputStyle} resize-none min-h-[38px] overflow-hidden flex-1`}
				rows={1}
			/>
		</div>
	);
}

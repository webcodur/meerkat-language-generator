import { COLUMN_WIDTHS } from '@/data/constant/columnWidths';
import { Translation } from '@/types/translate';
import { buttonStyle } from '../styles';

interface GenerateButtonProps {
	row: Translation;
	index: number;
	loadingRows: { [key: number]: boolean };
	onSubmit: (index: number) => void;
}

export default function GenerateButton({ row, index, loadingRows, onSubmit }: GenerateButtonProps) {
	return (
		<button
			type="button"
			onClick={() => onSubmit(index)}
			disabled={loadingRows[index] || row.isVerified}
			className={`${buttonStyle} ${
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
	);
}

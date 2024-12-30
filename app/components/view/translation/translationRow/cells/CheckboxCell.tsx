import { COLUMN_WIDTHS } from '@/data/constant/columnWidths';

interface CheckboxCellProps {
	index: number;
	selectedRows: number[];
	onRowSelect: (index: number, selected: boolean) => void;
}

export default function CheckboxCell({ index, selectedRows, onRowSelect }: CheckboxCellProps) {
	return (
		<div
			className="flex items-center justify-center"
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
				className="w-5 h-5 border-2 border-gray-300 rounded cursor-pointer text-primary-600 focus:ring-primary-500"
			/>
		</div>
	);
}

import { COLUMN_WIDTHS } from '@/app/data/constant/columnWidths';

const headerCellClass =
	'text-center flex items-center justify-center text-sm font-medium text-primary-700';

export default function TableHeader() {
	return (
		<div className="flex pb-2 space-x-2 border-b">
			<div className={`${COLUMN_WIDTHS.checkbox} ${headerCellClass}`}>선택</div>
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
	);
}

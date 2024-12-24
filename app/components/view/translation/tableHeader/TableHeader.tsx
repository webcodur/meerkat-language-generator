import { COLUMN_WIDTHS } from '@/data/constant/columnWidths';

const headerCellStyle =
	'text-center flex items-center justify-center text-base font-medium text-primary-700';

type ColumnType = keyof typeof COLUMN_WIDTHS;

const headers: Array<{ type: ColumnType; text: string }> = [
	{ type: 'checkbox', text: '선택' },
	{ type: 'number', text: '번호' },
	{ type: 'koreanWord', text: '한국어 단어 *' },
	{ type: 'koreanDesc', text: '한국어 설명' },
	{ type: 'button', text: '생성' },
	{ type: 'englishKey', text: '영문 키값' },
	{ type: 'translation', text: '영어' },
	{ type: 'translation', text: '아랍어' },
	{ type: 'button', text: '검수' },
	{ type: 'number', text: '제거' },
];

export default function TableHeader() {
	return (
		<div className="flex pb-2 space-x-2 border-b">
			{headers.map((header, index) => {
				const width = COLUMN_WIDTHS[header.type];
				return (
					<div
						key={index}
						className={headerCellStyle}
						style={{
							width,
							minWidth: width,
							maxWidth: width,
						}}
					>
						{header.text}
					</div>
				);
			})}
		</div>
	);
}

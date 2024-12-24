/**
 * ModelInfo 컴포넌트의 props 인터페이스
 * @interface ModelInfoProps
 * @property {string} model - 현재 사용 중인 AI 모델의 이름
 */
interface ModelInfoProps {
	model: string;
}

/**
 * AI 모델 정보를 표시하는 컴포넌트
 * @component ModelInfo
 * @param {ModelInfoProps} props - 컴포넌트 props
 * @returns {JSX.Element} 모델 정보를 포함한 UI 요소
 *
 * @description
 * - OpenAI 로고와 현재 사용 중인 모델 이름을 표시
 * - 모델명이 없을 경우 'Loading...' 텍스트를 표시
 * - 녹색 배지 스타일로 모델명을 강조
 */
export default function ModelInfo({ model }: ModelInfoProps) {
	return (
		<div className="mb-6 text-center">
			<p className="text-sm text-primary-500">
				Powered by OpenAI
				<span className="inline-flex items-center justify-center px-2 py-1 ml-2 text-xs font-medium text-primary-700 bg-primary-100 rounded-full">
					{model || 'Loading...'}
				</span>
			</p>
		</div>
	);
}

import React from 'react';

export default function LoadingState() {
	return (
		<div className="flex items-center justify-center min-h-[400px]">
			<div className="text-center">
				<div className="inline-block w-8 h-8 mb-4 border-t-2 border-b-2 border-primary-500 rounded-full animate-spin"></div>
				<p className="text-gray-600">번역 파일 로딩중...</p>
			</div>
		</div>
	);
}

import React from 'react';

export default function LoadingState() {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
			<div className="p-6 text-center bg-white rounded-lg shadow-lg">
				<div className="inline-block w-8 h-8 mb-4 border-t-2 border-b-2 rounded-full border-primary-500 animate-spin"></div>
				<p className="text-gray-600">번역 파일 로딩중...</p>
			</div>
		</div>
	);
}

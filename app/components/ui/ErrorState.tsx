import React from 'react';

interface ErrorStateProps {
	error: string;
	onRefresh: () => void;
}

export default function ErrorState({ error, onRefresh }: ErrorStateProps) {
	return (
		<div className="flex items-center justify-center min-h-[400px]">
			<div className="text-center">
				<p className="mb-4 text-red-500">{error}</p>
				<button
					onClick={onRefresh}
					className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
				>
					새로고침
				</button>
			</div>
		</div>
	);
}

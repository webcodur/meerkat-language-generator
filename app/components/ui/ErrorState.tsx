import React from 'react';
import { FaSync } from 'react-icons/fa';

interface ErrorStateProps {
	error: string;
	onRefresh: () => void;
}

export default function ErrorState({ error, onRefresh }: ErrorStateProps) {
	const buttonClass =
		'px-4 py-2 text-white rounded flex items-center justify-center gap-2 text-sm font-medium transition-colors duration-200';

	return (
		<div className="flex items-center justify-center min-h-[400px]">
			<div className="text-center">
				<p className="mb-4 text-primary-500">{error}</p>
				<button
					onClick={onRefresh}
					className={`${buttonClass} bg-primary-500 hover:bg-primary-600`}
				>
					<FaSync className="w-4 h-4" />
					새로고침
				</button>
			</div>
		</div>
	);
}

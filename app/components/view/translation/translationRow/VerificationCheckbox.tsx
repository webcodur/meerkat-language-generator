import React from 'react';

interface VerificationCheckboxProps {
	checked: boolean;
	onChange: (checked: boolean) => void;
	width: number;
}

const VerificationCheckbox = ({ checked, onChange, width }: VerificationCheckboxProps) => {
	return (
		<div
			className="flex items-center justify-center"
			style={{
				width,
				minWidth: width,
				maxWidth: width,
			}}
		>
			<input
				type="checkbox"
				checked={checked}
				onChange={(e) => onChange(e.target.checked)}
				className="w-6 h-6 scale-125 border-2 border-gray-300 rounded cursor-pointer text-primary-600 focus:ring-primary-500"
			/>
		</div>
	);
};

export default VerificationCheckbox;

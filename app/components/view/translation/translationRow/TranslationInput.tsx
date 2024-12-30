import React from 'react';
import { FaVolumeUp } from 'react-icons/fa';

interface TranslationInputProps {
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	language: string;
	width: number;
	isRTL?: boolean;
}

const TranslationInput = ({
	value,
	onChange,
	disabled = false,
	language,
	width,
	isRTL = false,
}: TranslationInputProps) => {
	const inputStyle =
		'p-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none whitespace-nowrap';

	const speak = (text: string, lang: string) => {
		const voices = window.speechSynthesis.getVoices();
		const isLanguageSupported = voices.some((voice) =>
			voice.lang.startsWith(lang.split('-')[0])
		);

		if (!isLanguageSupported) {
			alert(`[TTS API] ${lang}은/는 Web Speech API에서 지원하지 않습니다.`);
			return;
		}

		const utterance = new SpeechSynthesisUtterance(text);
		utterance.lang = lang;
		window.speechSynthesis.speak(utterance);
	};

	return (
		<div
			className="flex items-center"
			style={{
				width,
				minWidth: width,
				maxWidth: width,
			}}
		>
			<div className="flex-1 min-w-0">
				<input
					type="text"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					disabled={disabled}
					className={`${inputStyle} w-full ${
						disabled ? 'bg-gray-100 cursor-not-allowed' : ''
					} ${isRTL ? 'text-right' : ''}`}
					dir={isRTL ? 'rtl' : 'ltr'}
				/>
			</div>
			<button
				onClick={() => speak(value, language)}
				className="flex-shrink-0 p-2 text-gray-600 hover:text-primary-500"
				title="발음 듣기"
			>
				<FaVolumeUp />
			</button>
		</div>
	);
};

export default TranslationInput;

interface ModelInfoProps {
  model: string;
}

export default function ModelInfo({ model }: ModelInfoProps) {
  return (
    <div className="mb-6 text-center">
      <p className="text-sm text-gray-500">
        Powered by OpenAI
        <span className="inline-flex items-center justify-center px-2 py-1 ml-2 text-xs font-medium text-green-700 bg-green-100 rounded-full">
          {model || 'Loading...'}
        </span>
      </p>
    </div>
  );
} 
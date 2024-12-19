interface BottomActionsProps {
  onDuplicate: () => void;
  onRefresh: () => void;
  onSave: () => void;
  onDownload: (type: 'ko' | 'en' | 'ar') => void;
  isLocked: boolean;
}

export default function BottomActions({
  onDuplicate,
  onRefresh,
  onSave,
  onDownload,
  isLocked
}: BottomActionsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 py-4 bg-white border-t">
      <div className="px-6 mx-auto max-w-7xl">
        <div className="flex justify-center space-x-4">
          <button
            type="button"
            onClick={onDuplicate}
            className="px-6 py-2 text-white bg-green-500 rounded hover:bg-green-600">
            + 행 추가
          </button>
          <button
            type="button"
            onClick={onRefresh}
            className="px-6 py-2 text-white bg-gray-500 rounded hover:bg-gray-600">
            새로고침
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isLocked}
            className={`px-6 py-2 text-white rounded ${
              isLocked 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}>
            DB저장 (gist)
          </button>
          <div className="w-px h-6 my-auto bg-gray-300"></div>
          <button
            type="button"
            onClick={() => onDownload('ko')}
            className="px-6 py-2 text-white bg-purple-500 rounded hover:bg-purple-600">
            ko.json
          </button>
          <button
            type="button"
            onClick={() => onDownload('en')}
            className="px-6 py-2 text-white bg-purple-500 rounded hover:bg-purple-600">
            en.json
          </button>
          <button
            type="button"
            onClick={() => onDownload('ar')}
            className="px-6 py-2 text-white bg-purple-500 rounded hover:bg-purple-600">
            ar.json
          </button>
        </div>
      </div>
    </div>
  );
} 
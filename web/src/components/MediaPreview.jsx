import { useState, useEffect } from 'react';
import { RiCloseLine } from 'react-icons/ri';

export const MediaPreview = ({ file, onConfirm, onCancel, isUploading }) => {
  const [preview, setPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);

  useEffect(() => {
    if (!file) return;

    const type = file.type.split('/')[0];
    setMediaType(type);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  }, [file]);

  if (!file || !preview) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
          <button
            onClick={onCancel}
            disabled={isUploading}
            className="text-gray-400 hover:text-gray-600"
          >
            <RiCloseLine size={24} />
          </button>
        </div>

        {/* Preview Content */}
        <div className="p-6 bg-gray-50 flex items-center justify-center min-h-96">
          {mediaType === 'image' ? (
            <img 
              src={preview} 
              alt="Preview" 
              className="max-w-full max-h-96 rounded-lg"
            />
          ) : mediaType === 'video' ? (
            <video 
              src={preview} 
              controls 
              className="max-w-full max-h-96 rounded-lg"
            />
          ) : (
            <div className="text-center">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-gray-700 font-medium">{file.name}</p>
              <p className="text-gray-500 text-sm mt-2">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="px-6 py-4 bg-white border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-medium">File:</span> {file.name}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-medium">Size:</span> {(file.size / 1024).toFixed(2)} KB
          </p>
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-medium">Type:</span> {file.type}
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-200 justify-end">
          <button
            onClick={onCancel}
            disabled={isUploading}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isUploading}
            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium disabled:opacity-50"
          >
            {isUploading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

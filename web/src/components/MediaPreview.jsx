import { useState, useEffect } from 'react';
import { RiCloseLine } from 'react-icons/ri';

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024, // 10 MB
  video: 100 * 1024 * 1024, // 100 MB
  audio: 50 * 1024 * 1024, // 50 MB
  file: 50 * 1024 * 1024 // 50 MB
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const MediaPreview = ({ file, onConfirm, onCancel, isUploading }) => {
  const [preview, setPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!file) return;

    setError(null);
    const type = file.type.split('/')[0] || 'file';
    setMediaType(type);

    // Check file size
    const limit = FILE_SIZE_LIMITS[type] || FILE_SIZE_LIMITS.file;
    if (file.size > limit) {
      setError(`File too large. Maximum size: ${formatFileSize(limit)}`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  }, [file]);

  // Show error modal if file size exceeded
  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">File Too Large</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <RiCloseLine size={24} />
            </button>
          </div>

          {/* Error Content */}
          <div className="p-6 bg-red-50">
            <p className="text-red-700 font-medium mb-4">{error}</p>
            <div className="bg-white rounded p-3 border border-red-200">
              <p className="text-sm text-gray-600">
                <span className="font-medium">File:</span> {file.name}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <span className="font-medium">Size:</span> {formatFileSize(file.size)}
              </p>
            </div>
          </div>

          {/* Size Limits Info */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Maximum File Sizes:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>📷 Images: {formatFileSize(FILE_SIZE_LIMITS.image)}</li>
              <li>🎥 Videos: {formatFileSize(FILE_SIZE_LIMITS.video)}</li>
              <li>🔊 Audio: {formatFileSize(FILE_SIZE_LIMITS.audio)}</li>
              <li>📄 Files: {formatFileSize(FILE_SIZE_LIMITS.file)}</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-4 border-t border-gray-200 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                {formatFileSize(file.size)}
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
            <span className="font-medium">Size:</span> {formatFileSize(file.size)}
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

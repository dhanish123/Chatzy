import { useState, useRef, useEffect } from 'react';
import { RiAttachmentLine } from 'react-icons/ri';
import { MdImage, MdAudioFile } from 'react-icons/md';
import { AiOutlineFile } from 'react-icons/ai';

export const MediaDropdown = ({ onFileSelect, isUploading }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [uploadType, setUploadType] = useState(null);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      setShowDropdown(false);
    }
  };

  const triggerPhotoVideoUpload = () => {
    setUploadType('photo-video');
    fileInputRef.current?.click();
  };

  const triggerFileUpload = () => {
    setUploadType('file');
    fileInputRef.current?.click();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isUploading}
        className="text-gray-600 hover:text-blue-600 disabled:text-gray-400 flex-shrink-0"
        title="Attach media"
      >
        <RiAttachmentLine size={20} />
      </button>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileInput}
        className="hidden"
        accept={
          uploadType === 'photo-video'
            ? 'image/*,video/*'
            : '.pdf,.doc,.docx,.txt,.xls,.xlsx,.zip,.rar'
        }
      />

      {showDropdown && (
        <div className="absolute bottom-12 left-0 z-50 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="min-w-48">
            {/* Photo & Video Option */}
            <button
              onClick={triggerPhotoVideoUpload}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-left border-b border-gray-200 transition-colors"
            >
              <MdImage size={20} className="text-blue-600" />
              <div>
                <p className="font-medium text-gray-800">Photo & Video</p>
                <p className="text-xs text-gray-500">Send images or videos</p>
              </div>
            </button>

            {/* Files Option */}
            <button
              onClick={triggerFileUpload}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-left transition-colors"
            >
              <AiOutlineFile size={20} className="text-green-600" />
              <div>
                <p className="font-medium text-gray-800">Files</p>
                <p className="text-xs text-gray-500">Send documents or files</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

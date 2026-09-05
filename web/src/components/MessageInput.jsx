import { useState, useRef } from 'react';
import { RiSendPlaneFill, RiCloseLine } from 'react-icons/ri';
import { Input } from './Input.jsx';
import { Button } from './Button.jsx';
import { uploadAPI } from '../services/api.js';
import { VoiceRecorder } from './VoiceRecorder.jsx';
import { EmojiPickerPopup } from './EmojiPickerPopup.jsx';
import { MediaDropdown } from './MediaDropdown.jsx';
import { MediaPreview } from './MediaPreview.jsx';

export const MessageInput = ({ 
  onSend, 
  editingMessage, 
  onCancelEdit, 
  onEditSave,
  replyingTo,
  onCancelReply,
  onSetReply,
  isBlocked
}) => {
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

  const handleSend = async () => {
    if (editingMessage) {
      onEditSave(message);
      setMessage('');
    } else if (message.trim() || uploading) {
      onSend(message, null, null, replyingTo?._id);
      setMessage('');
      onCancelReply?.();
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    // Show preview instead of uploading immediately
    setSelectedFile(file);
    setShowPreview(true);
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      let response;
      if (selectedFile.type.startsWith('image/')) {
        response = await uploadAPI.image(selectedFile);
      } else if (selectedFile.type.startsWith('video/')) {
        response = await uploadAPI.video(selectedFile);
      } else if (selectedFile.type.startsWith('audio/')) {
        response = await uploadAPI.audio(selectedFile);
      } else {
        response = await uploadAPI.file(selectedFile);
      }
      
      const mediaType = selectedFile.type.split('/')[0];
      onSend('', response.data.url, mediaType === 'application' ? 'file' : mediaType, replyingTo?._id);
      onCancelReply?.();
      setSelectedFile(null);
      setShowPreview(false);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleVoiceRecordSend = async (audioBlob) => {
    setUploading(true);
    try {
      const response = await uploadAPI.audio(audioBlob);
      onSend('', response.data.url, 'audio', replyingTo?._id);
      onCancelReply?.();
      setIsRecording(false);
    } catch (error) {
      console.error('Voice upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      {editingMessage && (
        <div className="bg-blue-50 border-l-4 border-blue-600 p-3 mb-3 flex justify-between items-center">
          <div>
            <p className="text-xs font-semibold text-blue-600">Editing message</p>
            <p className="text-sm text-gray-700 truncate">{editingMessage.content}</p>
          </div>
          <button onClick={onCancelEdit} className="text-gray-400 hover:text-gray-600">
            <RiCloseLine />
          </button>
        </div>
      )}

      {replyingTo && (
        <div className="bg-gray-50 border-l-4 border-gray-400 p-3 mb-3 flex justify-between items-center">
          <div>
            <p className="text-xs font-semibold text-gray-600">Replying to</p>
            <p className="text-sm text-gray-700 truncate">{replyingTo.content}</p>
          </div>
          <button onClick={onCancelReply} className="text-gray-400 hover:text-gray-600">
            <RiCloseLine />
          </button>
        </div>
      )}

      {isRecording ? (
        <VoiceRecorder
          onSend={handleVoiceRecordSend}
          onCancel={() => setIsRecording(false)}
        />
      ) : (
        <div className="flex items-center gap-3">
          <MediaDropdown
            onFileSelect={handleFileUpload}
            isUploading={uploading}
          />

          <EmojiPickerPopup onEmojiClick={handleEmojiSelect} />

          <button
            onClick={() => setIsRecording(true)}
            className="text-gray-600 hover:text-blue-600 flex-shrink-0 disabled:text-gray-400 disabled:cursor-not-allowed"
            title={isBlocked ? "This user has blocked you" : "Record voice message"}
            disabled={uploading || isBlocked}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v12a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>

          <input
            type="text"
            placeholder={isBlocked ? "This user has blocked you" : (editingMessage ? "Edit message..." : "Type a message...")}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={uploading || isBlocked}
          />

          <button
            onClick={handleSend}
            disabled={(!message.trim() && !uploading) || uploading}
            className="text-blue-600 hover:text-blue-700 disabled:text-gray-400"
          >
            <RiSendPlaneFill size={20} />
          </button>
        </div>
      )}

      {/* Media Preview Modal */}
      <MediaPreview
        file={selectedFile}
        onConfirm={handleConfirmUpload}
        onCancel={() => {
          setSelectedFile(null);
          setShowPreview(false);
        }}
        isUploading={uploading}
      />
    </div>
  );
};

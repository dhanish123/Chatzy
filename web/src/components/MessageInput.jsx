import { useState, useRef } from 'react';
import { RiSendPlaneFill, RiAttachmentLine, RiEmojiStickerLine } from 'react-icons/ri';
import { BsMic } from 'react-icons/bs';
import { RiCloseLine } from 'react-icons/ri';
import { Input } from './Input.jsx';
import { Button } from './Button.jsx';
import { uploadAPI } from '../services/api.js';

export const MessageInput = ({ 
  onSend, 
  editingMessage, 
  onCancelEdit, 
  onEditSave,
  replyingTo,
  onCancelReply,
  onSetReply
}) => {
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
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

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      let response;
      if (file.type.startsWith('image/')) {
        response = await uploadAPI.image(file);
      } else if (file.type.startsWith('video/')) {
        response = await uploadAPI.video(file);
      } else if (file.type.startsWith('audio/')) {
        response = await uploadAPI.audio(file);
      } else {
        response = await uploadAPI.file(file);
      }
      
      const mediaType = file.type.split('/')[0];
      onSend('', response.data.url, mediaType === 'application' ? 'file' : mediaType, replyingTo?._id);
      onCancelReply?.();
    } catch (error) {
      console.error('Upload error:', error);
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

      <div className="flex items-center gap-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-gray-600 hover:text-blue-600"
          disabled={uploading}
        >
          <RiAttachmentLine size={20} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf"
        />

        <button className="text-gray-600 hover:text-blue-600">
          <RiEmojiStickerLine size={20} />
        </button>

        <button className="text-gray-600 hover:text-blue-600">
          <BsMic size={20} />
        </button>

        <input
          type="text"
          placeholder={editingMessage ? "Edit message..." : "Type a message..."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleSend}
          disabled={(!message.trim() && !uploading) || uploading}
          className="text-blue-600 hover:text-blue-700 disabled:text-gray-400"
        >
          <RiSendPlaneFill size={20} />
        </button>
      </div>
    </div>
  );
};

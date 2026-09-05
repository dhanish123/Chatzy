import { BsCheck2, BsCheck2All } from 'react-icons/bs';
import { Avatar } from './Avatar.jsx';
import { AudioMessage } from './AudioMessage.jsx';
import { useState } from 'react';

export const MessageBubble = ({
  message,
  isOwn = false,
  isGroup = false,
  onReply = null,
  onEdit = null,
  onDelete = null,
  onHover = null
}) => {
  const canEdit = isOwn && !message.isDeleted && Date.now() - new Date(message.createdAt).getTime() < 10 * 60 * 1000;
  const canDelete = isOwn && !message.isDeleted && Date.now() - new Date(message.createdAt).getTime() < 10 * 60 * 1000;
  const [imageLoadError, setImageLoadError] = useState(false);

  // Check if media URL is valid (not old /uploads/ path)
  const isValidMediaUrl = message.mediaUrl && !message.mediaUrl.startsWith('/uploads/');

  const handleImageError = () => {
    setImageLoadError(true);
  };

  return (
    <div
      className={`flex mb-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => onHover?.(message._id)}
      onMouseLeave={() => onHover?.(null)}
    >
      {!isOwn && (
        <Avatar 
          src={message.senderId?.profileImage} 
          initials={message.senderId?.username?.[0]} 
          size="sm" 
          className="mr-2"
        />
      )}
      
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        {isGroup && !isOwn && (
          <p className="text-xs font-semibold text-gray-700 mb-1">
            {message.senderId?.username}
          </p>
        )}
        
        {message.replyTo && (
          <div className={`text-xs mb-1 p-2 rounded ${isOwn ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <p className="font-semibold">Reply to</p>
            <p className="text-gray-600 truncate">{message.replyTo.content}</p>
          </div>
        )}
        
        <div
          className={`px-4 py-2 rounded-lg ${
            isOwn ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-200 text-black rounded-bl-none'
          }`}
        >
          {message.isDeleted ? (
            <p className="italic text-gray-500">Message deleted</p>
          ) : message.mediaType === 'audio' && isValidMediaUrl ? (
            <AudioMessage audioUrl={message.mediaUrl} />
          ) : isValidMediaUrl ? (
            <div>
              {message.mediaType === 'image' && !imageLoadError && (
                <img 
                  src={message.mediaUrl} 
                  alt="message" 
                  className="max-w-xs rounded" 
                  onError={handleImageError}
                  loading="lazy"
                />
              )}
              {message.mediaType === 'video' && (
                <video src={message.mediaUrl} controls className="max-w-xs rounded" />
              )}
              {message.mediaType === 'audio' && (
                <audio src={message.mediaUrl} controls className="max-w-xs rounded" />
              )}
              {message.mediaType === 'file' && (
                <div className="bg-gray-100 p-3 rounded flex items-center gap-2 max-w-xs">
                  <span className="text-2xl">📄</span>
                  <a href={message.mediaUrl} download target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-700 break-all">
                    Download File
                  </a>
                </div>
              )}
              {(message.mediaType === 'application' || message.mediaType === 'application/pdf') && (
                <div className="flex flex-col gap-2">
                  <iframe 
                    src={message.mediaUrl} 
                    className="w-80 h-96 rounded border border-gray-300"
                    title="PDF Viewer"
                  />
                  <a href={message.mediaUrl} download target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-700 text-sm">
                    Download PDF
                  </a>
                </div>
              )}
              {message.content && <p className="mt-2">{message.content}</p>}
            </div>
          ) : (
            <p>{message.content}</p>
          )}
          {message.isEdited && <p className="text-xs italic">(edited)</p>}
        </div>

        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
          <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
          {isOwn && (
            <>
              {message.status === 'sent' && <BsCheck2 />}
              {message.status === 'delivered' && <BsCheck2All />}
              {message.status === 'read' && <BsCheck2All className="text-blue-600" />}
            </>
          )}
        </div>

        {(canEdit || canDelete) && (
          <div className="flex gap-2 mt-1 text-xs">
            {canEdit && <button onClick={() => onEdit?.(message)} className="text-blue-600 hover:underline">Edit</button>}
            {canDelete && <button onClick={() => onDelete?.(message._id)} className="text-red-600 hover:underline">Delete</button>}
            {onReply && <button onClick={() => onReply?.(message)} className="text-gray-600 hover:underline">Reply</button>}
          </div>
        )}
      </div>
    </div>
  );
};

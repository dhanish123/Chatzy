import { BsCheck2, BsCheck2All } from 'react-icons/bs';
import { Avatar } from './Avatar.jsx';

export const MessageBubble = ({
  message,
  isOwn = false,
  onReply = null,
  onEdit = null,
  onDelete = null,
  onHover = null
}) => {
  const canEdit = isOwn && !message.isDeleted && Date.now() - new Date(message.createdAt).getTime() < 10 * 60 * 1000;
  const canDelete = isOwn && !message.isDeleted && Date.now() - new Date(message.createdAt).getTime() < 10 * 60 * 1000;

  return (
    <div
      className={`flex mb-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => onHover?.(message._id)}
      onMouseLeave={() => onHover?.(null)}
    >
      {!isOwn && <Avatar src="" initials="U" size="sm" className="mr-2" />}
      
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
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
          ) : message.mediaUrl ? (
            <div>
              {message.mediaType === 'image' && (
                <img src={message.mediaUrl} alt="message" className="max-w-xs rounded" />
              )}
              {message.mediaType === 'video' && (
                <video src={message.mediaUrl} controls className="max-w-xs rounded" />
              )}
              {message.mediaType === 'audio' && (
                <audio src={message.mediaUrl} controls className="w-full" />
              )}
              {message.mediaType === 'file' && (
                <a href={message.mediaUrl} target="_blank" rel="noopener noreferrer" className="underline">
                  Download file
                </a>
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

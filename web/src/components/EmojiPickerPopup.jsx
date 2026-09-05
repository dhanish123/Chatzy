import { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { RiEmojiStickerLine } from 'react-icons/ri';

export const EmojiPickerPopup = ({ onEmojiClick }) => {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPicker]);

  const handleEmojiClick = (emojiObject) => {
    onEmojiClick(emojiObject.emoji);
    setShowPicker(false);
  };

  return (
    <div className="relative" ref={pickerRef}>
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="text-gray-600 hover:text-blue-600 flex-shrink-0"
        title="Add emoji"
      >
        <RiEmojiStickerLine size={20} />
      </button>

      {showPicker && (
        <div className="absolute bottom-12 left-0 z-50">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme="light"
            width={300}
            height={400}
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}
    </div>
  );
};

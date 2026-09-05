import { useState } from 'react';

export const Avatar = ({
  src = '',
  alt = '',
  size = 'md',
  className = '',
  initials = ''
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  const [imageError, setImageError] = useState(false);

  // Build proper image URL
  let imageUrl = '';
  if (src) {
    // If already a full URL, use as-is
    if (src.startsWith('http')) {
      imageUrl = src;
    } 
    // If relative path starting with /, prepend API URL
    else if (src.startsWith('/')) {
      const apiUrl = import.meta.env.VITE_API_URL;
      imageUrl = `${apiUrl}${src}`;
    }
    // Otherwise prepend API URL with /
    else {
      const apiUrl = import.meta.env.VITE_API_URL;
      imageUrl = `${apiUrl}/${src}`;
    }
  }

  const handleImageError = () => {
    setImageError(true);
    console.error('Failed to load image:', imageUrl);
  };

  return (
    <div className={`${sizes[size]} rounded-full bg-blue-500 text-white flex items-center justify-center overflow-hidden flex-shrink-0 ${className}`}>
      {src && !imageError ? (
        <img 
          src={imageUrl} 
          alt={alt} 
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      ) : (
        <span className="font-semibold">{initials}</span>
      )}
    </div>
  );
};

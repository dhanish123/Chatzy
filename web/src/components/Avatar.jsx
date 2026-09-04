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

  return (
    <div className={`${sizes[size]} rounded-full bg-blue-500 text-white flex items-center justify-center overflow-hidden flex-shrink-0 ${className}`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span className="font-semibold">{initials}</span>
      )}
    </div>
  );
};

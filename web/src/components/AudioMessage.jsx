import { useState, useRef, useEffect } from 'react';

export const AudioMessage = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const generateWaveform = () => {
    const bars = [];
    for (let i = 0; i < 20; i++) {
      const height = Math.sin(i * 0.5 + currentTime * 0.1) * 15 + 18;
      bars.push(
        <div
          key={i}
          className="w-0.5 bg-blue-600 rounded-full transition-all"
          style={{ height: `${height}px` }}
        />
      );
    }
    return bars;
  };

  return (
    <div className="flex items-center gap-3 bg-white rounded-lg p-3 w-fit max-w-xs border border-gray-200 shadow-sm">
      <audio ref={audioRef} src={audioUrl} />

      <button
        onClick={togglePlay}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2.5 flex-shrink-0 transition-colors"
      >
        {isPlaying ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <div className="flex items-center gap-1 h-8">
        {generateWaveform()}
      </div>

      <span className="text-xs text-gray-700 font-medium ml-1 whitespace-nowrap">
        {formatTime(duration)}
      </span>
    </div>
  );
};

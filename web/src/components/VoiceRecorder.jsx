import { useState, useRef, useEffect } from 'react';
import { BsMic, BsMicFill, BsStop, BsPlay } from 'react-icons/bs';
import { RiSendPlaneFill, RiCloseLine } from 'react-icons/ri';

export const VoiceRecorder = ({ onSend, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const audioRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up audio context for waveform visualization
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 2048;

      // Start recording
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setRecordedBlob(blob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setDuration(0);

      // Update duration
      durationIntervalRef.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);

      // Draw waveform
      drawWaveform();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationIdRef.current = requestAnimationFrame(draw);

      analyserRef.current.getByteFrequencyData(dataArray);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#3b82f6';
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }

      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSend = async () => {
    if (recordedBlob) {
      // Create FormData for the audio blob
      onSend(recordedBlob);
      setRecordedBlob(null);
      setDuration(0);
    }
  };

  const handleCancel = () => {
    if (isRecording) {
      stopRecording();
    }
    setRecordedBlob(null);
    setDuration(0);
    setIsPlaying(false);
    onCancel();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (recordedBlob) {
    return (
      <div className="bg-gray-50 border-t border-gray-200 p-4">
        <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-lg p-4">
          <audio
            ref={audioRef}
            src={URL.createObjectURL(recordedBlob)}
            onEnded={() => setIsPlaying(false)}
          />
          
          <button
            onClick={togglePlayback}
            className="text-blue-600 hover:text-blue-700 flex-shrink-0"
          >
            {isPlaying ? <BsStop size={20} /> : <BsPlay size={20} />}
          </button>

          <div className="flex-1 flex items-center gap-2">
            <div className="bg-blue-100 rounded-full p-2">
              <BsMic size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Voice Message</p>
              <p className="text-xs text-gray-500">{formatTime(duration)}</p>
            </div>
          </div>

          <button
            onClick={handleSend}
            className="text-green-600 hover:text-green-700 flex-shrink-0"
          >
            <RiSendPlaneFill size={20} />
          </button>

          <button
            onClick={handleCancel}
            className="text-red-600 hover:text-red-700 flex-shrink-0"
          >
            <RiCloseLine size={20} />
          </button>
        </div>
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-t border-blue-200 p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="animate-pulse">
                <BsMicFill size={24} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Recording...</p>
                <p className="text-xs text-gray-600">{formatTime(duration)}</p>
              </div>
            </div>

            <button
              onClick={stopRecording}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <BsStop size={16} />
              Stop
            </button>

            <button
              onClick={handleCancel}
              className="text-gray-600 hover:text-gray-700"
            >
              <RiCloseLine size={20} />
            </button>
          </div>

          {/* Waveform visualization */}
          <canvas
            ref={canvasRef}
            width={300}
            height={80}
            className="w-full border border-blue-300 rounded-lg bg-white"
          />
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={startRecording}
      className="text-gray-600 hover:text-blue-600 flex-shrink-0"
      title="Record voice message"
    >
      <BsMic size={20} />
    </button>
  );
};

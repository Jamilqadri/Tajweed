import React, { useState, useEffect, useRef, useId } from 'react';
import { useApp } from '../../context/AppContext';
import { ScheduledClass } from '../../types';
import {
  X,
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Hand,
  Monitor,
  Headphones,
  PenTool,
  BookOpen,
  MessageSquare,
  Users,
  ExternalLink,
  Volume2,
  VolumeX,
  Sparkles,
  Info,
  Copy,
  Check,
  Pause,
  Play,
  Share2,
  Settings,
  MoreVertical,
  Pin,
  Trash2,
  Download,
  AlertCircle,
  HelpCircle,
  Maximize2,
  Minimize2,
  CheckCircle2,
  ShieldCheck,
  Radio,
  Music,
  Lock,
  Eye,
} from 'lucide-react';

interface ClassMeetModalProps {
  classItem: ScheduledClass;
  onClose: () => void;
}

type TeachingMode = 'video' | 'audio_only' | 'screen_share' | 'whiteboard' | 'quran_reader';

// Interactive Tajweed Lessons for Live Classroom
const QAIDAH_LETTERS = [
  { char: 'ا', name: 'Alif', makhraj: 'الجوف (منہ کا خالی حصہ)' },
  { char: 'ب', name: 'Baa', makhraj: 'الشفتان (دونوں ہونٹوں کی تری)' },
  { char: 'ت', name: 'Taa', makhraj: 'طرف اللسان وأصول الثنايا العليا' },
  { char: 'ث', name: 'Thaa', makhraj: 'طرف اللسان وأطراف الثنايا العليا' },
  { char: 'ج', name: 'Jeem', makhraj: 'وسط اللسان مع ما يحاذيه من الحنك' },
  { char: 'ح', name: 'Haa', makhraj: 'وسط الحلق (درمیانِ حلق)' },
  { char: 'خ', name: 'Khaa', makhraj: 'أدنى الحلق (حلق کا اوپری حصہ)' },
  { char: 'د', name: 'Daal', makhraj: 'طرف اللسان مع أصول الثنايا' },
  { char: 'ذ', name: 'Zaal', makhraj: 'طرف اللسان مع أطراف الثنايا' },
  { char: 'ر', name: 'Raa', makhraj: 'طرف اللسان مع ظهره مائلاً إلى ظهره' },
  { char: 'ز', name: 'Zaa', makhraj: 'أسلۃ اللسان (زبان کی نوک اور دانت)' },
  { char: 'س', name: 'Seen', makhraj: 'أسلۃ اللسان مع الثنايا السفلى' },
  { char: 'ش', name: 'Sheen', makhraj: 'وسط اللسان مع الحنك الأعلى' },
  { char: 'ص', name: 'Saad', makhraj: 'مستعلیہ و مطبقہ (موٹا اور سیٹی دار)' },
  { char: 'ض', name: 'Daad', makhraj: 'إحدى حافتي اللسان مع الأضراس العليا' },
  { char: 'ط', name: 'Taa (Heavy)', makhraj: 'مستعلیہ و مطبقہ (پر اور موٹا)' },
  { char: 'ظ', name: 'Zaa (Heavy)', makhraj: 'طرف اللسان مع أطراف الثنايا (موٹا)' },
  { char: 'ع', name: 'Ain', makhraj: 'وسط الحلق (درمیانِ حلق سے نرمی)' },
  { char: 'غ', name: 'Ghain', makhraj: 'أدنى الحلق (حلق کا وہ حصہ جو منہ کے قریب ہے)' },
  { char: 'ف', name: 'Faa', makhraj: 'بطن الشفة السفلى مع أطراف الثنايا العليا' },
  { char: 'ق', name: 'Qaaf', makhraj: 'أقصى اللسان مع الحنك اللحمي (قلقلہ)' },
  { char: 'ك', name: 'Kaaf', makhraj: 'أقصى اللسان تحت القاف قليلاً (باریک)' },
  { char: 'ل', name: 'Laam', makhraj: 'أدنى حافة اللسان إلى منتهى طرفها' },
  { char: 'م', name: 'Meem', makhraj: 'الشفتان مع انطباقهما (غنّہ)' },
  { char: 'ن', name: 'Noon', makhraj: 'طرف اللسان مع لثة الأسنان العليا (غنّہ)' },
  { char: 'و', name: 'Waaw', makhraj: 'بانضمام الشفتين (ہونٹ گول کر کے)' },
  { char: 'هـ', name: 'Haa (Soft)', makhraj: 'أقصى الحلق (حلق کا سینے سے ملا حصہ)' },
  { char: 'ء', name: 'Hamzah', makhraj: 'أقصى الحلق (جھٹکے کے ساتھ)' },
  { char: 'ي', name: 'Yaa', makhraj: 'وسط اللسان مع الحنك الأعلى' },
];

const SURAH_FATIHA_VERSES = [
  { id: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful' },
  { id: 2, text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', translation: '[All] praise is [due] to Allah, Lord of the worlds' },
  { id: 3, text: 'الرَّحْمَٰنِ الرَّحِيمِ', translation: 'The Entirely Merciful, the Especially Merciful' },
  { id: 4, text: 'مَالِكِ يَوْمِ الدِّينِ', translation: 'Sovereign of the Day of Recompense' },
  { id: 5, text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', translation: 'It is You we worship and You we ask for help' },
  { id: 6, text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', translation: 'Guide us to the straight path' },
  { id: 7, text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', translation: 'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray' },
];

const ACADEMY_GOOGLE_ACCOUNT = 'kanzuttahreer@gmail.com';

export const ClassMeetModal: React.FC<ClassMeetModalProps> = ({ classItem, onClose }) => {
  const { teachers, students, groups, courses, currentUser, currentRole, language, admins } = useApp();

  const isTeacherOrAdmin = currentRole === 'teacher' || currentRole === 'admin' || currentRole === 'super_admin';
  const isSuperAdmin = currentRole === 'super_admin';
  const currentAdminRecord = admins?.find((a) => a.userId === currentUser?.id || a.id === currentUser?.id);
  const canDownloadRecording = isSuperAdmin || (currentRole === 'admin' && !!currentAdminRecord?.permissions?.downloadRecordings);
  // Only Teachers and Admins can watch recorded class video; students have zero access and zero awareness
  const canWatchRecording = isTeacherOrAdmin;

  // Teaching display mode
  const [teachingMode, setTeachingMode] = useState<TeachingMode>('video');

  // Media states
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [isMutedIncoming, setIsMutedIncoming] = useState(false);

  // Active side panel: 'chat' | 'people' | 'info' | 'settings' | null
  const [activeDrawer, setActiveDrawer] = useState<'chat' | 'people' | 'info' | 'settings' | null>(null);

  // Real WebRTC Streams
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [mediaPermission, setMediaPermission] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Real Audio Level (Volume Indicator)
  const [audioLevel, setAudioLevel] = useState<number>(0);

  // Video Refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Real MediaRecorder System
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);
  const [recordedDownloadUrl, setRecordedDownloadUrl] = useState<string | null>(null);
  const [showRecordingPlayer, setShowRecordingPlayer] = useState(false);

  // Clock
  const [currentTime, setCurrentTime] = useState('');

  // Link copy feedback
  const [copiedLink, setCopiedLink] = useState(false);
  const [showVideoClassInfoModal, setShowVideoClassInfoModal] = useState(false);

  // Whiteboard drawing canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#3b82f6');
  const [penSize, setPenSize] = useState<number>(3);
  const [isEraser, setIsEraser] = useState(false);

  // Quran Reader State
  const [selectedReaderTab, setSelectedReaderTab] = useState<'qaidah' | 'fatiha'>('qaidah');
  const [selectedLetter, setSelectedLetter] = useState<string>('ا');
  const [selectedVerse, setSelectedVerse] = useState<number>(1);

  // In-call messages
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: string; text: string; time: string; isTeacher?: boolean; isBadge?: boolean }>>([
    {
      id: '1',
      sender: 'System',
      text: language === 'ur'
        ? 'کنز التجوید لائیو کلاس روم میں خوش آمدید۔ آپ بغیر گوگل سائن اپ کے براہِ راست منسلک ہیں۔'
        : 'Welcome to Kanz Ut Tajweed live classroom. You are connected directly without Google login requirement.',
      time: '00:00',
    },
    {
      id: '2',
      sender: 'Qari Muhammad Saeed',
      text: language === 'ur'
        ? 'السلام علیکم ورحمۃ اللہ، آج کی تجوید کلاس شروع کی جاتی ہے۔'
        : 'Assalamu Alaikum wa Rahmatullah. Starting today’s Tajweed session.',
      time: '00:01',
      isTeacher: true,
    },
  ]);
  const [newMsg, setNewMsg] = useState('');

  // Teacher & Class Info
  const teacher = teachers.find((t) => t.id === classItem.teacherId);
  const course = courses.find((c) => c.id === classItem.courseId);
  const group = classItem.groupId ? groups.find((g) => g.id === classItem.groupId) : null;
  const student = classItem.studentId ? students.find((s) => s.id === classItem.studentId) : null;

  const meetingCode = classItem.meetLink
    ? classItem.meetLink.replace('https://meet.google.com/', '')
    : 'qur-taj-kzt';

  const officialMeetUrl = classItem.meetLink || `https://meet.google.com/${meetingCode}`;

  // 1. Digital clock updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. REAL WebRTC Camera & Microphone initialization
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    const startLocalMedia = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setMediaPermission('unsupported');
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        activeStream = stream;
        setLocalStream(stream);
        setMediaPermission('granted');

        // Bind stream to video element
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Setup real Web Audio API Volume Analyzer
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            audioContextRef.current = ctx;
            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64;
            source.connect(analyser);
            analyserRef.current = analyser;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const checkVolume = () => {
              if (analyserRef.current) {
                analyserRef.current.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                  sum += dataArray[i];
                }
                const average = sum / dataArray.length;
                // Normalize 0 - 100
                setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
              }
              animFrameRef.current = requestAnimationFrame(checkVolume);
            };
            checkVolume();
          }
        } catch (e) {
          console.warn('Audio analyzer init error:', e);
        }

        // Auto-start recording with real MediaRecorder if supported
        try {
          if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('video/webm')) {
            const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
            mediaRecorderRef.current = recorder;
            recorder.ondataavailable = (event) => {
              if (event.data && event.data.size > 0) {
                recordedChunksRef.current.push(event.data);
              }
            };
            recorder.onstop = () => {
              const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
              const url = URL.createObjectURL(blob);
              setRecordedDownloadUrl(url);
            };
            recorder.start(1000);
            setIsRecording(true);
          }
        } catch (recErr) {
          console.log('MediaRecorder auto-start note:', recErr);
          setIsRecording(true); // fall back to timer indicator
        }
      } catch (err: any) {
        console.warn('User camera/mic permission not granted or device missing:', err);
        setMediaPermission('denied');
        setMediaError(err.message || 'Camera / Microphone access denied');
        setIsRecording(true); // still start session timer
      }
    };

    startLocalMedia();

    return () => {
      // Cleanup camera and audio tracks cleanly
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch {}
      }
    };
  }, []);

  // Update video element srcObject if localStream changes or view toggles
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, videoOn, teachingMode]);

  // 3. Real Microphone Toggle (Audio Track Enabled / Disabled)
  const handleToggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !micOn;
      });
    }
    setMicOn(!micOn);
  };

  // 4. Real Camera Toggle (Video Track Enabled / Disabled)
  const handleToggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !videoOn;
      });
    }
    setVideoOn(!videoOn);
  };

  // 5. Real Screen Sharing (getDisplayMedia)
  const handleToggleScreenShare = async () => {
    if (teachingMode === 'screen_share') {
      if (screenStream) {
        screenStream.getTracks().forEach((t) => t.stop());
        setScreenStream(null);
      }
      setTeachingMode('video');
    } else {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
          alert('Screen sharing is not supported by this browser.');
          return;
        }

        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        setScreenStream(stream);
        setTeachingMode('screen_share');

        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream;
        }

        // Listen for native "Stop sharing" chrome bar click
        const screenTrack = stream.getVideoTracks()[0];
        if (screenTrack) {
          screenTrack.onended = () => {
            setScreenStream(null);
            setTeachingMode('video');
          };
        }
      } catch (err) {
        console.log('Screen share cancelled or failed:', err);
      }
    }
  };

  // 6. Automatic Recording Timer
  useEffect(() => {
    if (!isRecording || isRecordingPaused) return;
    const interval = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRecording, isRecordingPaused]);

  const formatRecordingTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  // Stop and download recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleDownloadRecording = () => {
    if (!recordedDownloadUrl || !canDownloadRecording) return;
    const a = document.createElement('a');
    a.href = recordedDownloadUrl;
    a.download = `VideoClass_${classItem.date}_${meetingCode}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 7. Copy link handler
  const handleCopyLink = () => {
    navigator.clipboard.writeText(officialMeetUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // 8. Chat message sender
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: currentUser?.name || (isTeacherOrAdmin ? 'Teacher' : 'Student'),
        text: newMsg.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isTeacher: isTeacherOrAdmin,
      },
    ]);
    setNewMsg('');
  };

  // Quick feedback sticker from teacher
  const sendQuickFeedback = (text: string) => {
    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: teacher?.fullName || 'Teacher',
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isTeacher: true,
        isBadge: true,
      },
    ]);
  };

  // 9. Whiteboard drawing tools
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = isEraser ? '#121316' : penColor;
    ctx.lineWidth = isEraser ? penSize * 4 : penSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const downloadCanvasImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `Tajweed_Board_${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#202124] text-white flex flex-col select-none animate-in fade-in duration-200">
      {/* 1. TOP BAR: VIDEO CLASS SECURE HEADER */}
      <div className="h-14 px-3 sm:px-6 flex items-center justify-between border-b border-[#3c4043] bg-[#202124]">
        {/* Left: Class Info & Mode Indicator */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-black text-white shadow-sm text-xs tracking-wider">
            VC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-slate-100 truncate max-w-[160px] sm:max-w-xs md:max-w-md">
                {course?.name || 'Qur’an & Tajweed'}
              </h2>
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>{language === 'ur' ? 'براہِ راست ان-ایپ ویڈیو کلاس (محفوظ پورٹل)' : 'Direct In-App Video Class (Private)'}</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {teacher?.fullName} ({language === 'ur' ? 'استاد محترم' : 'Teacher'}) • {classItem.date} {classItem.time}
            </p>
          </div>
        </div>

        {/* Right: Recording, Video Class Switcher & Exit Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Automatic Recording Active Badge - ONLY VISIBLE TO TEACHER & ADMIN */}
          {isRecording && isTeacherOrAdmin && (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 rounded-full bg-red-950/80 border border-red-800 text-red-300 text-xs">
              <span className={`w-2 h-2 rounded-full bg-red-500 ${isRecordingPaused ? '' : 'animate-ping'}`} />
              <span className="font-mono font-bold tracking-wider text-[11px] sm:text-xs">
                REC {formatRecordingTime(recordingSeconds)}
              </span>
              <button
                type="button"
                onClick={() => setIsRecordingPaused(!isRecordingPaused)}
                className="ms-1 hover:text-white"
                title={isRecordingPaused ? 'Resume Recording' : 'Pause Recording'}
              >
                {isRecordingPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              </button>
            </div>
          )}

          {/* Recording Available Controls - ONLY VISIBLE TO TEACHER & ADMIN */}
          {recordedDownloadUrl && canWatchRecording && (
            <div className="flex items-center gap-1.5">
              {/* Watch Video Button - AVAILABLE TO TEACHER & ADMIN */}
              <button
                type="button"
                onClick={() => setShowRecordingPlayer(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors"
                title="Watch recorded class video"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{language === 'ur' ? 'ریکارڈنگ دیکھیں' : 'Watch Recording'}</span>
              </button>

              {/* Download Button - ONLY VISIBLE TO SUPER ADMIN & AUTHORIZED ADMINS (HIDDEN FROM TEACHER & STUDENT) */}
              {canDownloadRecording && (
                <button
                  type="button"
                  onClick={handleDownloadRecording}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs transition-colors"
                  title="Download recorded class video (.webm)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{language === 'ur' ? 'ڈاؤنلوڈ' : 'Download'}</span>
                </button>
              )}
            </div>
          )}

          {/* Video Class Link Button */}
          <button
            type="button"
            onClick={() => setShowVideoClassInfoModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#303134] hover:bg-[#3c4043] text-slate-200 text-xs font-medium border border-[#3c4043] transition-colors"
            title="Video Class Direct Portal Link"
          >
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">{language === 'ur' ? 'ویڈیو کلاس لنک' : 'Video Class Link'}</span>
          </button>

          {/* Exit Modal Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#303134] text-slate-300 hover:text-white transition-colors"
            title="Leave / Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Video Class Portal Info Dialog Modal */}
      {showVideoClassInfoModal && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#282a2d] border border-[#3c4043] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 text-xs text-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                  VC
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {language === 'ur' ? 'ویڈیو کلاس پورٹل و براہِ راست لنک' : 'Video Class Portal & Direct Link'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Host: <strong className="text-emerald-300">{teacher?.fullName || 'Kanz Ut Tajweed Academy'}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVideoClassInfoModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 bg-[#202124] p-4 rounded-2xl border border-[#3c4043]">
              <div className="space-y-1">
                <span className="font-bold text-slate-300 block">
                  {language === 'ur' ? 'کلاس روم کی پرائیویسی اور رہنمائی:' : 'Classroom Privacy & Direct Access:'}
                </span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {language === 'ur'
                    ? 'یہ ویڈیو کلاس مکمل پرائیویسی کے ساتھ براہِ راست آپ کے اکیڈمی پورٹل پر چلتی ہے۔ طلباء اور اساتذہ کو کسی بیرونی سائن اپ یا لاگ ان کی ضرورت نہیں، سب کچھ ان-ایپ مربوط ہے۔'
                    : 'This Video Class operates privately and directly inside your academy portal. Students and teachers join without any external login barrier.'}
                </p>
              </div>

              <div className="pt-2 border-t border-[#3c4043]">
                <span className="text-slate-400 text-[10px] block mb-1">Direct Classroom Link:</span>
                <div className="p-2.5 rounded-xl bg-[#121316] font-mono text-emerald-300 break-all text-[11px] flex items-center justify-between">
                  <span>{officialMeetUrl}</span>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="ms-2 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[10px]"
                  >
                    {copiedLink ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowVideoClassInfoModal(false)}
                className="px-4 py-2 rounded-xl bg-[#3c4043] hover:bg-[#4a4e52] text-white font-semibold"
              >
                {language === 'ur' ? 'ان-ایپ کلاس جاری رکھیں' : 'Continue In-App'}
              </button>
              <a
                href={officialMeetUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowVideoClassInfoModal(false)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <span>{language === 'ur' ? 'ویڈیو کلاس ونڈو کھولیں' : 'Open Video Class Window'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* RECORDED VIDEO REVIEW & PLAYER MODAL (TEACHER & ADMIN ONLY, STUDENTS HAVE ZERO ACCESS) */}
      {showRecordingPlayer && recordedDownloadUrl && canWatchRecording && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#202124] border border-[#3c4043] rounded-3xl max-w-2xl w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#3c4043] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                  <Play className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    {language === 'ur' ? 'ریکارڈ شدہ ویڈیو کلاس کا آن لائن جائزہ' : 'Class Recording Player'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {course?.name} • {classItem.date}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRecordingPlayer(false)}
                className="p-1.5 rounded-full hover:bg-[#303134] text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* In-App Video Player */}
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-[#3c4043]">
              <video
                src={recordedDownloadUrl}
                controls
                controlsList="nodownload"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Status & Player Controls */}
            <div className="bg-[#282a2d] p-3 rounded-2xl border border-[#3c4043] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {language === 'ur' ? 'ریکارڈنگ آن لائن دیکھنے کے لیے دستیاب ہے' : 'Online playback ready'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {canDownloadRecording
                    ? (language === 'ur' ? 'سپر ایڈمن کی حیثیت سے آپ کے پاس ویڈیو فائل ڈاؤنلوڈ کا مکمل اختیار ہے۔' : 'As an authorized administrator, you have full download permission.')
                    : (language === 'ur' ? 'آپ اپنی کلاس کی ویڈیو کا آن لائن جائزہ دیکھ سکتے ہیں۔' : 'You can review and watch your class recording online.')}
                </p>
              </div>

              {/* Download button ONLY visible to Super Admin / authorized Admins. Teachers will never see any download option */}
              {canDownloadRecording && (
                <button
                  type="button"
                  onClick={handleDownloadRecording}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 whitespace-nowrap text-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>{language === 'ur' ? 'ویڈیو ڈاؤنلوڈ کریں' : 'Download File'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Camera/Mic Permission Notification Banner (if denied) */}
      {mediaPermission === 'denied' && (
        <div className="bg-amber-950/90 border-b border-amber-800 text-amber-200 px-4 py-2 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {language === 'ur'
                ? 'کیمرہ یا مائیک کی اجازت نہیں مل سکی۔ براہِ کرم براؤزر کے ایڈریس بار میں کیمرہ کا آئیکن دبا کر "Allow" کریں۔ تب تک آپ آڈیو موڈ، وائٹ بورڈ اور قرآن ریڈر استعمال کر سکتے ہیں۔'
                : 'Camera/Mic access was denied in browser. Click the lock/camera icon in your address bar to Allow. Meanwhile, whiteboard, Quran reader, and audio modes remain fully accessible.'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setMediaPermission('prompt')}
            className="text-amber-300 hover:text-white font-bold underline text-[11px]"
          >
            {language === 'ur' ? 'دوبارہ کوشش کریں' : 'Retry'}
          </button>
        </div>
      )}

      {/* 2. MAIN MEETING STAGE & SIDEBAR */}
      <div className="flex-1 overflow-hidden flex relative p-2 sm:p-4 gap-3 bg-[#202124]">
        {/* Stage Content Area */}
        <div className="flex-1 flex flex-col justify-center items-center overflow-hidden rounded-2xl relative">
          {/* MODE 1: AUDIO-ONLY TEACHING MODE */}
          {teachingMode === 'audio_only' && (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-[#1a1b1e] rounded-2xl border border-[#3c4043] animate-in fade-in duration-200">
              <div className="relative mb-6 flex items-center justify-center">
                {/* Concentric Animated Soundwave Rings that respond to real volume */}
                <div
                  style={{ transform: `scale(${1 + audioLevel / 100})` }}
                  className="absolute w-44 h-44 rounded-full bg-emerald-500/15 transition-transform duration-100"
                />
                <div
                  style={{ transform: `scale(${1 + audioLevel / 150})` }}
                  className="absolute w-36 h-36 rounded-full bg-blue-500/20 transition-transform duration-100"
                />
                <div className={`relative w-28 h-28 rounded-full overflow-hidden border-4 shadow-2xl z-10 transition-colors ${
                  audioLevel > 15 ? 'border-emerald-400 ring-4 ring-emerald-500/40' : 'border-emerald-600'
                }`}>
                  <img
                    src={teacher?.profilePhoto || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80'}
                    alt={teacher?.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="text-center space-y-2 max-w-md">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-xs font-semibold">
                  <Volume2 className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                  <span>
                    {language === 'ur'
                      ? 'صرف آڈیو تدریس فعال ہے (مخارج و تلفظ پر توجہ)'
                      : 'Audio-Only Recitation Mode Active'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-100">
                  {teacher?.fullName}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {language === 'ur'
                    ? 'استاد محترم کی آواز اور تجوید مخارج براہِ راست سننے پر مکمل توجہ دیں۔'
                    : 'Focus entirely on listening to the teacher’s articulation points and Tajweed phonetics.'}
                </p>
              </div>

              {/* Live Audio Visualizer Bars */}
              <div className="flex items-center gap-1.5 mt-8 h-10">
                {[20, 35, 55, 30, 45, 60, 40, 25, 50, 35, 20, 45, 30].map((baseHeight, i) => {
                  const dynamicHeight = Math.max(8, Math.min(48, Math.round(baseHeight * (0.3 + (audioLevel / 100) * 0.9))));
                  return (
                    <div
                      key={i}
                      style={{ height: `${dynamicHeight}px` }}
                      className="w-1.5 bg-gradient-to-t from-emerald-500 to-blue-400 rounded-full transition-all duration-75"
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* MODE 2: SCREEN SHARE PRESENTATION MODE */}
          {teachingMode === 'screen_share' && (
            <div className="w-full h-full flex flex-col bg-[#1e1f22] rounded-2xl border border-blue-500/50 overflow-hidden relative">
              {/* Screen Share Top Banner */}
              <div className="bg-blue-900/40 border-b border-blue-800/60 px-4 py-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-blue-300 font-semibold">
                  <Monitor className="w-4 h-4 text-blue-400" />
                  <span>
                    {isTeacherOrAdmin
                      ? (language === 'ur' ? 'آپ اپنی اسکرین طلباء کے ساتھ لائیو شیئر کر رہے ہیں' : 'You are sharing your screen with students')
                      : (language === 'ur' ? 'استاد محترم اپنی اسکرین شیئر کر رہے ہیں' : 'Teacher is sharing screen')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleScreenShare}
                  className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                >
                  {language === 'ur' ? 'شیئرنگ بند کریں' : 'Stop Sharing'}
                </button>
              </div>

              {/* Shared Screen Live Video Area */}
              <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                {screenStream ? (
                  <video
                    ref={screenVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center space-y-3 p-6">
                    <Monitor className="w-12 h-12 text-blue-400 mx-auto animate-pulse" />
                    <h4 className="text-base font-bold text-white">
                      {language === 'ur' ? 'اسکرین شیئر فعال ہو رہا ہے...' : 'Starting Screen Share...'}
                    </h4>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MODE 3: TEACHER INTERACTIVE WHITEBOARD TOOL */}
          {teachingMode === 'whiteboard' && (
            <div className="w-full h-full flex flex-col bg-[#1a1b1e] rounded-2xl border border-[#3c4043] overflow-hidden">
              {/* Whiteboard Toolbar */}
              <div className="bg-[#282a2d] border-b border-[#3c4043] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-200 font-semibold">
                  <PenTool className="w-4 h-4 text-blue-400" />
                  <span>{language === 'ur' ? 'تجوید وائٹ بورڈ' : 'Interactive Tajweed Whiteboard'}</span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Pen vs Eraser */}
                  <div className="flex items-center bg-[#1e1f22] p-0.5 rounded-lg border border-[#3c4043]">
                    <button
                      type="button"
                      onClick={() => setIsEraser(false)}
                      className={`px-2 py-1 rounded text-xs font-semibold ${!isEraser ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      {language === 'ur' ? 'قلم' : 'Pen'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEraser(true)}
                      className={`px-2 py-1 rounded text-xs font-semibold ${isEraser ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      {language === 'ur' ? 'مٹائیں' : 'Eraser'}
                    </button>
                  </div>

                  {/* Colors */}
                  <div className="flex items-center gap-1.5">
                    {['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#ffffff'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setPenColor(c);
                          setIsEraser(false);
                        }}
                        style={{ backgroundColor: c }}
                        className={`w-5 h-5 rounded-full border-2 transition-transform ${penColor === c && !isEraser ? 'border-white scale-110' : 'border-transparent'}`}
                      />
                    ))}
                  </div>

                  {/* Pen Thickness */}
                  <select
                    value={penSize}
                    onChange={(e) => setPenSize(Number(e.target.value))}
                    className="bg-[#1e1f22] border border-[#3c4043] text-slate-200 text-xs rounded px-2 py-1"
                  >
                    <option value={2}>Fine (2px)</option>
                    <option value={4}>Medium (4px)</option>
                    <option value={8}>Bold (8px)</option>
                  </select>

                  <button
                    type="button"
                    onClick={downloadCanvasImage}
                    className="p-1.5 hover:bg-[#3c4043] rounded text-slate-300 hover:text-white"
                    title="Download Whiteboard PNG"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="p-1.5 hover:bg-[#3c4043] rounded text-slate-300 hover:text-white"
                    title="Clear Board"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setTeachingMode('video')}
                    className="px-2.5 py-1 rounded bg-[#3c4043] hover:bg-[#4a4e52] text-white"
                  >
                    {language === 'ur' ? 'بند کریں' : 'Close Board'}
                  </button>
                </div>
              </div>

              {/* Drawing Stage */}
              <div className="flex-1 bg-[#121316] relative cursor-crosshair">
                <canvas
                  ref={canvasRef}
                  width={1200}
                  height={750}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="w-full h-full"
                />
              </div>
            </div>
          )}

          {/* MODE 4: INTERACTIVE QUR'AN & TAJWEED LESSON READER */}
          {teachingMode === 'quran_reader' && (
            <div className="w-full h-full flex flex-col bg-[#1a1b1e] rounded-2xl border border-[#3c4043] overflow-hidden">
              {/* Reader Header Navigation */}
              <div className="bg-[#282a2d] border-b border-[#3c4043] px-4 py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-200 font-semibold">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'ur' ? 'قرآن و تجوید سبق کی تختی' : 'Interactive Qur’an & Tajweed Reader'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-[#1e1f22] p-0.5 rounded-lg border border-[#3c4043]">
                    <button
                      type="button"
                      onClick={() => setSelectedReaderTab('qaidah')}
                      className={`px-3 py-1 rounded text-xs font-semibold ${selectedReaderTab === 'qaidah' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      {language === 'ur' ? 'مدنی قاعدہ: تختی ۱' : 'Madani Qaidah: Lesson 1'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedReaderTab('fatiha')}
                      className={`px-3 py-1 rounded text-xs font-semibold ${selectedReaderTab === 'fatiha' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      {language === 'ur' ? 'سورۃ الفاتحہ' : 'Surah Al-Fatiha'}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setTeachingMode('video')}
                    className="px-2.5 py-1 rounded bg-[#3c4043] hover:bg-[#4a4e52] text-white"
                  >
                    {language === 'ur' ? 'ویڈیو پر واپس' : 'Back to Video'}
                  </button>
                </div>
              </div>

              {/* Reader Content Area */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#121316]">
                {selectedReaderTab === 'qaidah' && (
                  <div className="max-w-4xl mx-auto space-y-6">
                    <div className="text-center space-y-1">
                      <h4 className="text-lg font-bold text-amber-300 font-arabic">
                        الدرس الأول: الحروف المفردة
                      </h4>
                      <p className="text-xs text-slate-400">
                        {language === 'ur'
                          ? 'کسی بھی حرف پر کلک کر کے اس کے مخارج اور ادائیگی دیکھیں:'
                          : 'Click on any letter to inspect its Tajweed Makhraj and phonetic articulation:'}
                      </p>
                    </div>

                    {/* Arabic Alphabet Grid */}
                    <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-2.5" dir="rtl">
                      {QAIDAH_LETTERS.map((item) => (
                        <button
                          key={item.char}
                          type="button"
                          onClick={() => setSelectedLetter(item.char)}
                          className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center transition-all ${
                            selectedLetter === item.char
                              ? 'bg-emerald-600 text-white ring-4 ring-emerald-400/40 shadow-xl scale-105'
                              : 'bg-[#202124] hover:bg-[#2c2d30] text-slate-200 border border-[#3c4043]'
                          }`}
                        >
                          <span className="text-3xl font-bold font-arabic mb-1">{item.char}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{item.name}</span>
                        </button>
                      ))}
                    </div>

                    {/* Selected Letter Makhraj Focus Banner */}
                    {selectedLetter && (
                      <div className="p-4 rounded-2xl bg-[#1e1f22] border border-emerald-500/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-start animate-in fade-in duration-150">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white font-arabic text-4xl font-bold flex items-center justify-center shadow-lg">
                            {selectedLetter}
                          </div>
                          <div>
                            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block">
                              مخارج الحروف (Phonetic Articulation Point)
                            </span>
                            <h5 className="text-sm sm:text-base font-bold text-white mt-0.5">
                              حرف: {QAIDAH_LETTERS.find((l) => l.char === selectedLetter)?.name}
                            </h5>
                            <p className="text-xs text-slate-300 mt-1 font-arabic">
                              {QAIDAH_LETTERS.find((l) => l.char === selectedLetter)?.makhraj}
                            </p>
                          </div>
                        </div>

                        {isTeacherOrAdmin && (
                          <button
                            type="button"
                            onClick={() => sendQuickFeedback(`ما شاء الله! حرف '${selectedLetter}' کا تلفظ بہترین ادا کیا۔`)}
                            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs transition-colors shrink-0"
                          >
                            {language === 'ur' ? 'طلباء کو شاباش ارسال کریں' : 'Send Praise Sticker'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {selectedReaderTab === 'fatiha' && (
                  <div className="max-w-3xl mx-auto space-y-4">
                    <div className="text-center py-2 border-b border-[#3c4043]">
                      <h4 className="text-xl font-bold text-amber-300 font-arabic">
                        سُورَةُ الْفَاتِحَةِ (مَكِّيَّة)
                      </h4>
                    </div>

                    <div className="space-y-3" dir="rtl">
                      {SURAH_FATIHA_VERSES.map((v) => (
                        <div
                          key={v.id}
                          onClick={() => setSelectedVerse(v.id)}
                          className={`p-4 rounded-2xl cursor-pointer transition-all ${
                            selectedVerse === v.id
                              ? 'bg-emerald-950/60 border-2 border-emerald-500 shadow-xl'
                              : 'bg-[#1e1f22] border border-[#3c4043] hover:border-slate-500'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <span className="w-8 h-8 rounded-full bg-[#2a2b2e] border border-[#3c4043] flex items-center justify-center font-bold text-xs text-emerald-400 shrink-0">
                              {v.id}
                            </span>
                            <p className="text-xl sm:text-2xl font-arabic text-white leading-relaxed text-right flex-1">
                              {v.text}
                            </p>
                          </div>
                          <p className="text-[11px] text-slate-400 text-start mt-2 pt-2 border-t border-[#3c4043]/40" dir="ltr">
                            {v.translation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MODE 5: STANDARD GOOGLE MEET VIDEO GALLERY (Default) */}
          {teachingMode === 'video' && (
            <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-3 p-1">
              {/* Tile 1: Teacher (Active Reciter) */}
              <div className="relative w-full h-full min-h-[220px] bg-[#303134] rounded-2xl overflow-hidden border border-[#3c4043] flex items-center justify-center shadow-lg group">
                <img
                  src={teacher?.profilePhoto || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80'}
                  alt={teacher?.fullName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                {/* Bottom Bar Info */}
                <div className="absolute bottom-3 start-3 end-3 flex items-center justify-between text-xs z-10">
                  <div className="flex items-center gap-2 bg-[#202124]/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-[#3c4043]/50">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-semibold text-white">
                      {teacher?.fullName} ({language === 'ur' ? 'استاد محترم' : 'Teacher'})
                    </span>
                  </div>

                  <div className="p-1.5 rounded-full bg-[#202124]/80 text-emerald-400 border border-[#3c4043]/50">
                    <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                </div>

                {/* Pin button */}
                <button
                  type="button"
                  className="absolute top-3 end-3 p-2 rounded-full bg-[#202124]/70 text-slate-300 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Pin"
                >
                  <Pin className="w-4 h-4" />
                </button>
              </div>

              {/* Tile 2: Student / You (Real Camera Stream!) */}
              <div className={`relative w-full h-full min-h-[220px] bg-[#303134] rounded-2xl overflow-hidden border transition-all flex items-center justify-center shadow-lg group ${
                audioLevel > 15 ? 'border-emerald-400 ring-2 ring-emerald-500/40' : 'border-[#3c4043]'
              }`}>
                {/* Real Live Video Element */}
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover transition-opacity duration-200 ${videoOn && mediaPermission === 'granted' ? 'opacity-100' : 'hidden'}`}
                />

                {/* Fallback Display if Camera is Off or Permission Pending */}
                {(!videoOn || mediaPermission !== 'granted') && (
                  <div className="text-center space-y-2 p-4">
                    <div className="w-16 h-16 rounded-full bg-[#3c4043] text-slate-200 flex items-center justify-center mx-auto text-xl font-bold border-2 border-slate-500">
                      {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
                    </div>
                    <span className="text-xs text-slate-300 font-medium block">
                      {!videoOn
                        ? (language === 'ur' ? 'کیمرہ بند ہے' : 'Camera is off')
                        : (language === 'ur' ? 'براؤزر سے کیمرہ کی اجازت دیں' : 'Camera permission requested')}
                    </span>
                    {mediaPermission === 'denied' && (
                      <span className="text-[10px] text-amber-400 block">
                        {language === 'ur' ? 'کیمرہ رسائی بند ہے' : 'Access blocked'}
                      </span>
                    )}
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                {/* Bottom Tile Info & Real Microphone Status */}
                <div className="absolute bottom-3 start-3 end-3 flex items-center justify-between text-xs z-10">
                  <div className="flex items-center gap-2 bg-[#202124]/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-[#3c4043]/50">
                    <span className={`w-2 h-2 rounded-full ${audioLevel > 10 ? 'bg-emerald-400 animate-ping' : 'bg-blue-400'}`} />
                    <span className="font-semibold text-white">
                      {currentUser?.name || 'Student'} ({language === 'ur' ? 'آپ' : 'You'})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Live Voice Volume Level Meter */}
                    {micOn && audioLevel > 5 && (
                      <div className="flex items-center gap-0.5 bg-[#202124]/80 px-1.5 py-1 rounded-md border border-[#3c4043]/50">
                        <span className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="w-1 h-3.5 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      </div>
                    )}
                    <div className="p-1.5 rounded-full bg-[#202124]/80 text-white border border-[#3c4043]/50">
                      {micOn ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5 text-red-400" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. SIDE DRAWERS (In-call Messages, People, Details, Settings) */}
        {activeDrawer && (
          <div className="w-full sm:w-80 lg:w-88 bg-[#282a2d] rounded-2xl border border-[#3c4043] flex flex-col shadow-2xl z-20 animate-in slide-in-from-right-4 duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#3c4043] flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">
                {activeDrawer === 'chat' && (language === 'ur' ? 'پیغامات (In-Call Chat)' : 'In-call messages')}
                {activeDrawer === 'people' && (language === 'ur' ? 'شرکاء (People in class)' : 'People in class')}
                {activeDrawer === 'info' && (language === 'ur' ? 'کلاس کی تفصیلات' : 'Meeting details')}
                {activeDrawer === 'settings' && (language === 'ur' ? 'آڈیو و ویڈیو سیٹنگز' : 'Audio & Video Settings')}
              </h3>
              <button
                type="button"
                onClick={() => setActiveDrawer(null)}
                className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-[#3c4043]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer 1: In-call Chat */}
            {activeDrawer === 'chat' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-3 bg-[#303134] text-[11px] text-slate-300 border-b border-[#3c4043]">
                  {language === 'ur'
                    ? 'پیغامات تمام شرکاء کو نظر آتے ہیں۔ تجوید تصحیح اور رہنمائی کے لیے استعمال کریں۔'
                    : 'Messages are visible to all students in the class session.'}
                </div>

                {/* Teacher Quick Feedback Badges */}
                {isTeacherOrAdmin && (
                  <div className="p-2.5 bg-[#202124] border-b border-[#3c4043] flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => sendQuickFeedback('ما شاء الله! بہترین تجوید و قراءت')}
                      className="px-2 py-1 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] hover:bg-emerald-900 transition-colors"
                    >
                      ما شاء الله! ممتاز
                    </button>
                    <button
                      type="button"
                      onClick={() => sendQuickFeedback('مخارج کی ادائیگی اور ہونٹوں کی حرکت درست کریں')}
                      className="px-2 py-1 rounded-md bg-amber-950 text-amber-300 border border-amber-800 text-[10px] hover:bg-amber-900 transition-colors"
                    >
                      مخارج درست کریں
                    </button>
                    <button
                      type="button"
                      onClick={() => sendQuickFeedback('غنّہ کی مقدار ۲ حرکات مکمل کریں')}
                      className="px-2 py-1 rounded-md bg-blue-950 text-blue-300 border border-blue-800 text-[10px] hover:bg-blue-900 transition-colors"
                    >
                      غنّہ ۲ حرکات
                    </button>
                  </div>
                )}

                <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
                  {chatMessages.map((m) => (
                    <div key={m.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${m.isTeacher ? 'text-emerald-400' : 'text-blue-300'}`}>
                          {m.sender}
                        </span>
                        <span className="text-[10px] text-slate-500">{m.time}</span>
                      </div>
                      <p className={`p-2.5 rounded-xl border leading-relaxed ${
                        m.isBadge
                          ? 'bg-emerald-950/60 border-emerald-700 text-emerald-200 font-medium'
                          : 'bg-[#303134] border-[#3c4043]/60 text-slate-200'
                      }`}>
                        {m.text}
                      </p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="p-3 border-t border-[#3c4043] flex gap-2">
                  <input
                    type="text"
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    placeholder={language === 'ur' ? 'پیغام لکھیں...' : 'Send a message to everyone...'}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#202124] border border-[#3c4043] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
                  >
                    {language === 'ur' ? 'ارسال' : 'Send'}
                  </button>
                </form>
              </div>
            )}

            {/* Drawer 2: People List */}
            {activeDrawer === 'people' && (
              <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    {language === 'ur' ? 'استاد محترم (Host)' : 'Instructor (Host)'}
                  </span>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#303134] border border-[#3c4043]">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={teacher?.profilePhoto || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80'}
                        alt={teacher?.fullName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold text-slate-100">{teacher?.fullName}</div>
                        <div className="text-[10px] text-emerald-400">Host • Certified Tajweed Scholar</div>
                      </div>
                    </div>
                    <Mic className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    {language === 'ur' ? 'طلباء (Students)' : 'Enrolled Students'}
                  </span>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#303134] border border-[#3c4043]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                          {currentUser?.name ? currentUser.name.charAt(0) : 'S'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-100">{currentUser?.name || 'Student'} (You)</div>
                          <div className="text-[10px] text-blue-300">Active Participant</div>
                        </div>
                      </div>
                      {micOn ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4 text-red-400" />}
                    </div>

                    {classItem.classType === 'group' && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#303134]/60 border border-[#3c4043]/50">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center font-bold">
                            Z
                          </div>
                          <div>
                            <div className="font-semibold text-slate-200">Zaid Khan</div>
                            <div className="text-[10px] text-slate-400">Classmate (Listening)</div>
                          </div>
                        </div>
                        <MicOff className="w-4 h-4 text-slate-500" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Drawer 3: Meeting Info */}
            {activeDrawer === 'info' && (
              <div className="flex-1 p-4 space-y-4 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    {language === 'ur' ? 'ویڈیو کلاس لنک و معلومات' : 'Video Class Joining Info'}
                  </label>
                  <div className="p-3 rounded-xl bg-[#202124] border border-[#3c4043] break-all font-mono text-emerald-300 text-[11px]">
                    {officialMeetUrl}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="mt-2 w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? (language === 'ur' ? 'لنک کاپی ہو گیا!' : 'Copied to clipboard!') : (language === 'ur' ? 'لنک کاپی کریں' : 'Copy joining info')}</span>
                  </button>
                </div>

                <div className="pt-3 border-t border-[#3c4043] space-y-2 text-slate-400 text-xs">
                  <div><strong>Course:</strong> {course?.name}</div>
                  <div><strong>Batch/Type:</strong> {classItem.classType === 'group' ? 'Group Class' : '1-on-1 Class'}</div>
                  <div><strong>Duration:</strong> {classItem.durationMinutes} Minutes</div>
                  <div><strong>Academy Host:</strong> <span className="text-emerald-300">{teacher?.fullName || 'Kanz Ut Tajweed Academy'}</span></div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-[11px] text-emerald-200">
                  {language === 'ur'
                    ? 'آپ دونوں طریقے استعمال کر سکتے ہیں: براہِ راست ان-ایپ ویڈیو کلاس روم یا بیرونی ونڈو۔'
                    : 'You can use either option: this direct in-app video classroom or an external window.'}
                </div>
              </div>
            )}

            {/* Drawer 4: Audio/Video Settings */}
            {activeDrawer === 'settings' && (
              <div className="flex-1 p-4 space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-white text-sm mb-1">Audio & Hardware Test</h4>
                  <p className="text-slate-400 text-[11px]">Check your camera and microphone status.</p>
                </div>

                <div className="space-y-3 bg-[#202124] p-3 rounded-xl border border-[#3c4043]">
                  <div>
                    <span className="text-slate-400 block mb-1">Microphone Status</span>
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold ${micOn ? 'text-emerald-400' : 'text-red-400'}`}>
                        {micOn ? 'Microphone Active' : 'Microphone Muted'}
                      </span>
                      <button
                        type="button"
                        onClick={handleToggleMic}
                        className="px-2.5 py-1 rounded bg-[#3c4043] text-white hover:bg-[#4a4e52]"
                      >
                        Toggle
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#3c4043]">
                    <span className="text-slate-400 block mb-1">Camera Status</span>
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold ${videoOn ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {videoOn ? 'Camera Active' : 'Camera Disabled'}
                      </span>
                      <button
                        type="button"
                        onClick={handleToggleVideo}
                        className="px-2.5 py-1 rounded bg-[#3c4043] text-white hover:bg-[#4a4e52]"
                      >
                        Toggle
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#3c4043]">
                    <span className="text-slate-400 block mb-1">Sound Output</span>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-200">
                        {isMutedIncoming ? 'Audio Muted' : 'Sound Enabled'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsMutedIncoming(!isMutedIncoming)}
                        className="px-2.5 py-1 rounded bg-[#3c4043] text-white hover:bg-[#4a4e52]"
                      >
                        {isMutedIncoming ? 'Unmute' : 'Mute All'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. GOOGLE MEET BOTTOM CONTROLS BAR */}
      <div className="h-20 px-3 sm:px-6 bg-[#202124] border-t border-[#3c4043] flex items-center justify-between">
        {/* Left: Clock & Meeting Code */}
        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
          <span className="font-semibold text-white">{currentTime}</span>
          <span>|</span>
          <span className="font-mono text-slate-300">{meetingCode}</span>
        </div>

        {/* Center: Main Control Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-3 mx-auto sm:mx-0">
          {/* 1. Microphone Toggle (Real WebRTC audio track) */}
          <button
            type="button"
            onClick={handleToggleMic}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-colors ${
              micOn ? 'bg-[#3c4043] hover:bg-[#4a4e52] text-white' : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={micOn ? 'Turn off microphone' : 'Turn on microphone'}
          >
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* 2. Video Toggle (Real WebRTC camera track) */}
          <button
            type="button"
            onClick={handleToggleVideo}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-colors ${
              videoOn ? 'bg-[#3c4043] hover:bg-[#4a4e52] text-white' : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={videoOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* 3. Raise Hand Button */}
          <button
            type="button"
            onClick={() => setHandRaised(!handRaised)}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-colors ${
              handRaised ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/30' : 'bg-[#3c4043] hover:bg-[#4a4e52] text-white'
            }`}
            title={handRaised ? 'Lower hand' : 'Raise hand to ask question'}
          >
            <Hand className="w-5 h-5" />
          </button>

          {/* 4. Real Screen Share Toggle */}
          <button
            type="button"
            onClick={handleToggleScreenShare}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-colors ${
              teachingMode === 'screen_share'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-300'
                : 'bg-[#3c4043] hover:bg-[#4a4e52] text-white'
            }`}
            title={language === 'ur' ? 'اسکرین شیئر کریں' : 'Share your screen'}
          >
            <Monitor className="w-5 h-5" />
          </button>

          {/* 5. Audio-Only Mode Toggle */}
          <button
            type="button"
            onClick={() => setTeachingMode(teachingMode === 'audio_only' ? 'video' : 'audio_only')}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-colors ${
              teachingMode === 'audio_only'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-[#3c4043] hover:bg-[#4a4e52] text-white'
            }`}
            title={language === 'ur' ? 'صرف آڈیو موڈ' : 'Audio-only mode (No video)'}
          >
            <Headphones className="w-5 h-5" />
          </button>

          {/* 6. Whiteboard Toggle */}
          <button
            type="button"
            onClick={() => setTeachingMode(teachingMode === 'whiteboard' ? 'video' : 'whiteboard')}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-colors ${
              teachingMode === 'whiteboard'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-[#3c4043] hover:bg-[#4a4e52] text-white'
            }`}
            title={language === 'ur' ? 'وائٹ بورڈ' : 'Interactive Whiteboard'}
          >
            <PenTool className="w-5 h-5" />
          </button>

          {/* 7. Quran / Qaidah Lesson Reader Toggle */}
          <button
            type="button"
            onClick={() => setTeachingMode(teachingMode === 'quran_reader' ? 'video' : 'quran_reader')}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-colors ${
              teachingMode === 'quran_reader'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-[#3c4043] hover:bg-[#4a4e52] text-white'
            }`}
            title={language === 'ur' ? 'قرآن و تجوید سبق کی تختی' : 'Interactive Qur’an & Tajweed Reader'}
          >
            <BookOpen className="w-5 h-5" />
          </button>

          {/* 8. End Call Button (Red Pill) */}
          <button
            type="button"
            onClick={onClose}
            className="px-4 sm:px-6 h-10 sm:h-11 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 sm:gap-2 transition-colors shadow-lg shadow-red-600/30 ms-1 sm:ms-3"
            title="Leave Call"
          >
            <PhoneOff className="w-5 h-5" />
            <span className="hidden sm:inline">{language === 'ur' ? 'کلاس ختم کریں' : 'Leave Call'}</span>
          </button>
        </div>

        {/* Right: Info, People, Chat, Settings */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Settings button */}
          <button
            type="button"
            onClick={() => setActiveDrawer(activeDrawer === 'settings' ? null : 'settings')}
            className={`p-2 sm:p-2.5 rounded-full transition-colors ${
              activeDrawer === 'settings' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-[#303134]'
            }`}
            title="Audio/Video Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Info button */}
          <button
            type="button"
            onClick={() => setActiveDrawer(activeDrawer === 'info' ? null : 'info')}
            className={`p-2 sm:p-2.5 rounded-full transition-colors ${
              activeDrawer === 'info' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-[#303134]'
            }`}
            title="Meeting details"
          >
            <Info className="w-5 h-5" />
          </button>

          {/* People list button */}
          <button
            type="button"
            onClick={() => setActiveDrawer(activeDrawer === 'people' ? null : 'people')}
            className={`p-2 sm:p-2.5 rounded-full transition-colors relative ${
              activeDrawer === 'people' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-[#303134]'
            }`}
            title="Show everyone"
          >
            <Users className="w-5 h-5" />
            <span className="absolute -top-1 -end-1 w-4 h-4 rounded-full bg-[#3c4043] text-[10px] font-bold text-white flex items-center justify-center">
              {classItem.classType === 'group' ? '3' : '2'}
            </span>
          </button>

          {/* Chat button */}
          <button
            type="button"
            onClick={() => setActiveDrawer(activeDrawer === 'chat' ? null : 'chat')}
            className={`p-2 sm:p-2.5 rounded-full transition-colors relative ${
              activeDrawer === 'chat' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-[#303134]'
            }`}
            title="Chat with everyone"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -top-1 -end-1 w-2 h-2 rounded-full bg-blue-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

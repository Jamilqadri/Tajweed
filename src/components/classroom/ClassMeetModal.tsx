import React, { useState, useEffect, useRef } from 'react';
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
  MessageSquare,
  Users,
  ExternalLink,
  Volume2,
  Sparkles,
  Info,
  Copy,
  Check,
  Circle,
  Pause,
  Play,
  Share2,
  Settings,
  MoreVertical,
  Pin,
  Trash2,
} from 'lucide-react';

interface ClassMeetModalProps {
  classItem: ScheduledClass;
  onClose: () => void;
}

type TeachingMode = 'video' | 'audio_only' | 'screen_share' | 'whiteboard';

export const ClassMeetModal: React.FC<ClassMeetModalProps> = ({ classItem, onClose }) => {
  const { teachers, students, groups, courses, currentUser, currentRole, language } = useApp();

  const isTeacherOrAdmin = currentRole === 'teacher' || currentRole === 'admin' || currentRole === 'super_admin';

  // Teaching display mode - Teacher controls how they want to teach
  const [teachingMode, setTeachingMode] = useState<TeachingMode>('video');

  // Media states
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [handRaised, setHandRaised] = useState(false);

  // Active side panel: 'chat' | 'people' | 'info' | null
  const [activeDrawer, setActiveDrawer] = useState<'chat' | 'people' | 'info' | null>(null);

  // Auto-started Recording System
  const [recording, setRecording] = useState(true);
  const [recordingSeconds, setRecordingSeconds] = useState(1);
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);

  // Clock
  const [currentTime, setCurrentTime] = useState('');

  // Link copy feedback
  const [copiedLink, setCopiedLink] = useState(false);

  // Whiteboard drawing canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#3b82f6');

  // In-call messages
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: string; text: string; time: string; isTeacher?: boolean }>>([
    {
      id: '1',
      sender: 'System',
      text: language === 'ur' ? 'کلاس روم میں خوش آمدید۔ لائیو گوگل میٹ سیشن فعال ہے۔' : 'Welcome to Kanz Ut Tajweed Google Meet classroom.',
      time: '00:00',
    },
    {
      id: '2',
      sender: 'Qari Muhammad Saeed',
      text: language === 'ur' ? 'السلام علیکم ورحمۃ اللہ، آج کی تجوید کلاس شروع کی جاتی ہے۔' : 'Assalamu Alaikum wa Rahmatullah. Starting today’s Tajweed session.',
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

  // Digital clock updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Automatic Recording Timer (starts immediately upon joining)
  useEffect(() => {
    if (!recording || isRecordingPaused) return;
    const interval = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [recording, isRecordingPaused]);

  const formatRecordingTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(classItem.meetLink || `https://meet.google.com/${meetingCode}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

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

  // Screen share handler
  const handleToggleScreenShare = async () => {
    if (teachingMode === 'screen_share') {
      setTeachingMode('video');
    } else {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          // Trigger actual screen share prompt if available
          await navigator.mediaDevices.getDisplayMedia({ video: true });
        }
      } catch (err) {
        console.log('Using simulated presentation canvas for screen share:', err);
      }
      setTeachingMode('screen_share');
    }
  };

  // Whiteboard drawing tools
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#202124] text-white flex flex-col select-none animate-in fade-in duration-200">
      {/* 1. TOP GOOGLE MEET HEADER */}
      <div className="h-14 px-4 sm:px-6 flex items-center justify-between border-b border-[#3c4043] bg-[#202124]">
        {/* Left: Google Meet Logo & Class Details */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm text-xs">
            GM
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-semibold text-slate-100 truncate max-w-xs sm:max-w-md">
                {course?.name || 'Qur’an & Tajweed'}
              </h2>
              <span className="hidden sm:inline-block text-xs px-2 py-0.5 rounded-full bg-[#303134] text-slate-300 border border-[#3c4043]">
                {classItem.classType === 'group' ? (group?.name || 'Group Class') : `1-on-1 (${student?.fullName || 'Student'})`}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {teacher?.fullName} (Teacher) • {classItem.date} {classItem.time}
            </p>
          </div>
        </div>

        {/* Center/Right: Auto-Recording Indicator & Actions */}
        <div className="flex items-center gap-3">
          {/* Automatic Recording Active Badge */}
          {recording && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/70 border border-red-800/80 text-red-300 text-xs">
              <span className={`w-2 h-2 rounded-full bg-red-500 ${isRecordingPaused ? '' : 'animate-ping'}`} />
              <span className="font-mono font-bold tracking-wider">REC {formatRecordingTime(recordingSeconds)}</span>
              {isTeacherOrAdmin && (
                <button
                  type="button"
                  onClick={() => setIsRecordingPaused(!isRecordingPaused)}
                  className="ms-1 hover:text-white"
                  title={isRecordingPaused ? 'Resume Recording' : 'Pause Recording'}
                >
                  {isRecordingPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                </button>
              )}
            </div>
          )}

          {/* External Google Meet Tab Button */}
          <a
            href={classItem.meetLink || `https://meet.google.com/${meetingCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#303134] hover:bg-[#3c4043] text-slate-200 text-xs font-medium border border-[#3c4043] transition-colors"
          >
            <span>Open in Google Meet</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>

          {/* Exit Modal Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#303134] text-slate-300 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. MAIN MEETING STAGE & SIDEBAR */}
      <div className="flex-1 overflow-hidden flex relative p-3 sm:p-4 gap-3 bg-[#202124]">
        {/* Stage Content Area */}
        <div className="flex-1 flex flex-col justify-center items-center overflow-hidden rounded-2xl relative">
          {/* Notice: No forced text pre-written on screen! */}

          {/* MODE 1: AUDIO-ONLY TEACHING MODE (Selected by teacher) */}
          {teachingMode === 'audio_only' && (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-[#1a1b1e] rounded-2xl border border-[#3c4043]">
              <div className="relative mb-6 flex items-center justify-center">
                {/* Concentric Animated Soundwave Rings */}
                <div className="absolute w-44 h-44 rounded-full bg-emerald-500/10 animate-ping duration-1000" />
                <div className="absolute w-36 h-36 rounded-full bg-blue-500/20 animate-pulse" />
                <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-emerald-500 shadow-2xl z-10">
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

              {/* Audio visualizer bars simulation */}
              <div className="flex items-center gap-1.5 mt-8 h-10">
                {[16, 28, 40, 24, 36, 48, 30, 20, 44, 32, 18, 38, 22].map((height, i) => (
                  <div
                    key={i}
                    style={{ height: `${height}px` }}
                    className="w-1.5 bg-gradient-to-t from-emerald-500 to-blue-400 rounded-full animate-pulse"
                  />
                ))}
              </div>
            </div>
          )}

          {/* MODE 2: SCREEN SHARE PRESENTATION MODE (Selected by teacher) */}
          {teachingMode === 'screen_share' && (
            <div className="w-full h-full flex flex-col bg-[#1e1f22] rounded-2xl border border-blue-500/50 overflow-hidden relative">
              {/* Screen Share Top Banner */}
              <div className="bg-blue-900/40 border-b border-blue-800/60 px-4 py-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-blue-300 font-semibold">
                  <Monitor className="w-4 h-4 text-blue-400" />
                  <span>
                    {isTeacherOrAdmin
                      ? (language === 'ur' ? 'آپ اپنی اسکرین طلباء کے ساتھ شیئر کر رہے ہیں' : 'You are sharing your screen with students')
                      : (language === 'ur' ? 'استاد محترم اپنی اسکرین شیئر کر رہے ہیں' : 'Teacher is sharing their screen')}
                  </span>
                </div>
                {isTeacherOrAdmin && (
                  <button
                    type="button"
                    onClick={() => setTeachingMode('video')}
                    className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                  >
                    {language === 'ur' ? 'شیئرنگ بند کریں' : 'Stop Sharing'}
                  </button>
                )}
              </div>

              {/* Shared Screen Window Area */}
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-blue-950/80 border border-blue-800 flex items-center justify-center text-blue-400 shadow-xl">
                  <Monitor className="w-10 h-10" />
                </div>
                <div className="max-w-lg space-y-2">
                  <h4 className="text-lg font-bold text-slate-100">
                    {language === 'ur' ? 'لائیو اسکرین شیئر اسٹریمنگ' : 'Live Screen Presentation'}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {language === 'ur'
                      ? 'استاد محترم کا کمپیوٹر/ٹیبلٹ اسکرین کلاس میں لائیو شیئر ہو رہا ہے۔ جو کچھ استاد دکھائیں گے طلباء کو اسکرین پر نظر آئے گا۔'
                      : 'The teacher’s active screen or window is streaming in full high-definition to all enrolled students.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* MODE 3: TEACHER INTERACTIVE WHITEBOARD TOOL (Selected by teacher) */}
          {teachingMode === 'whiteboard' && (
            <div className="w-full h-full flex flex-col bg-[#1a1b1e] rounded-2xl border border-[#3c4043] overflow-hidden">
              {/* Whiteboard Toolbar */}
              <div className="bg-[#282a2d] border-b border-[#3c4043] px-4 py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-200 font-semibold">
                  <PenTool className="w-4 h-4 text-blue-400" />
                  <span>{language === 'ur' ? 'تجوید وائٹ بورڈ' : 'Interactive Tajweed Whiteboard'}</span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Colors */}
                  <div className="flex items-center gap-1.5">
                    {['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#ffffff'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setPenColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-5 h-5 rounded-full border-2 ${penColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                      />
                    ))}
                  </div>

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
                  width={900}
                  height={550}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="w-full h-full"
                />
              </div>
            </div>
          )}

          {/* MODE 4: STANDARD GOOGLE MEET VIDEO GALLERY (Default) */}
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
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
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

              {/* Tile 2: Student / You */}
              <div className="relative w-full h-full min-h-[220px] bg-[#303134] rounded-2xl overflow-hidden border border-[#3c4043] flex items-center justify-center shadow-lg group">
                {videoOn ? (
                  <img
                    src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop&q=80'}
                    alt="You"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 rounded-full bg-[#3c4043] text-slate-300 flex items-center justify-center mx-auto text-xl font-bold">
                      {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
                    </div>
                    <span className="text-xs text-slate-400 block">
                      {language === 'ur' ? 'کیمرہ بند ہے' : 'Camera is off'}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                <div className="absolute bottom-3 start-3 end-3 flex items-center justify-between text-xs z-10">
                  <div className="flex items-center gap-2 bg-[#202124]/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-[#3c4043]/50">
                    <span className="font-semibold text-white">
                      {currentUser?.name || 'Student'} ({language === 'ur' ? 'آپ' : 'You'})
                    </span>
                  </div>

                  <div className="p-1.5 rounded-full bg-[#202124]/80 text-white border border-[#3c4043]/50">
                    {micOn ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5 text-red-400" />}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. SIDE DRAWERS (In-call Messages, People, Meeting Details) */}
        {activeDrawer && (
          <div className="w-full sm:w-80 lg:w-88 bg-[#282a2d] rounded-2xl border border-[#3c4043] flex flex-col shadow-2xl z-20 animate-in slide-in-from-right-4 duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#3c4043] flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">
                {activeDrawer === 'chat' && (language === 'ur' ? 'پیغامات (In-Call Chat)' : 'In-call messages')}
                {activeDrawer === 'people' && (language === 'ur' ? 'حاضرین (People)' : 'People in class')}
                {activeDrawer === 'info' && (language === 'ur' ? 'کلاس کی تفصیلات' : 'Meeting details')}
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
                    ? 'پیغامات صرف کلاس کے شرکاء کو نظر آتے ہیں اور کلاس ختم ہونے پر محفوظ نہیں رہتے۔'
                    : 'Messages can be seen only by people in the call and are deleted when the call ends.'}
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
                  {chatMessages.map((m) => (
                    <div key={m.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${m.isTeacher ? 'text-emerald-400' : 'text-blue-300'}`}>
                          {m.sender}
                        </span>
                        <span className="text-[10px] text-slate-500">{m.time}</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed bg-[#303134] p-2.5 rounded-xl border border-[#3c4043]/60">
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
                        <div className="text-[10px] text-emerald-400">Host • Meeting Organizer</div>
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
                    {language === 'ur' ? 'گوگل میٹ لنک' : 'Joining info'}
                  </label>
                  <div className="p-3 rounded-xl bg-[#202124] border border-[#3c4043] break-all font-mono text-slate-300">
                    {classItem.meetLink || `https://meet.google.com/${meetingCode}`}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="mt-2 w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? (language === 'ur' ? 'لنک کاپی ہو گیا!' : 'Copied to clipboard!') : (language === 'ur' ? 'لنک کاپی کریں' : 'Copy joining info')}</span>
                  </button>
                </div>

                <div className="pt-3 border-t border-[#3c4043] space-y-2 text-slate-400 text-xs">
                  <div><strong>Course:</strong> {course?.name}</div>
                  <div><strong>Batch/Type:</strong> {classItem.classType === 'group' ? 'Group Class' : '1-on-1 Class'}</div>
                  <div><strong>Duration:</strong> {classItem.durationMinutes} Minutes</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. GOOGLE MEET BOTTOM CONTROLS BAR */}
      <div className="h-20 px-4 sm:px-6 bg-[#202124] border-t border-[#3c4043] flex items-center justify-between">
        {/* Left: Clock & Meeting Code */}
        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
          <span className="font-semibold text-white">{currentTime}</span>
          <span>|</span>
          <span className="font-mono text-slate-300">{meetingCode}</span>
        </div>

        {/* Center: Main Google Meet Control Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 mx-auto sm:mx-0">
          {/* 1. Microphone Toggle */}
          <button
            type="button"
            onClick={() => setMicOn(!micOn)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
              micOn ? 'bg-[#3c4043] hover:bg-[#4a4e52] text-white' : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={micOn ? 'Turn off microphone' : 'Turn on microphone'}
          >
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* 2. Video Toggle */}
          <button
            type="button"
            onClick={() => setVideoOn(!videoOn)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
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
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
              handRaised ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-[#3c4043] hover:bg-[#4a4e52] text-white'
            }`}
            title={handRaised ? 'Lower hand' : 'Raise hand to ask question'}
          >
            <Hand className="w-5 h-5" />
          </button>

          {/* 4. Teacher's Choice: Screen Share Toggle ("ٹیچر پہ ڈیپینڈ کرے وہ اسکرین شیئر کر کے پڑھانا چاہے") */}
          <button
            type="button"
            onClick={handleToggleScreenShare}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
              teachingMode === 'screen_share'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-[#3c4043] hover:bg-[#4a4e52] text-white'
            }`}
            title={language === 'ur' ? 'اسکرین شیئر کریں (Teacher Screen Share)' : 'Share your screen'}
          >
            <Monitor className="w-5 h-5" />
          </button>

          {/* 5. Teacher's Choice: Audio-Only Mode Toggle ("یا وہ صرف اڈیو میں پڑھانا چاہیں") */}
          <button
            type="button"
            onClick={() => setTeachingMode(teachingMode === 'audio_only' ? 'video' : 'audio_only')}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
              teachingMode === 'audio_only'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-[#3c4043] hover:bg-[#4a4e52] text-white'
            }`}
            title={language === 'ur' ? 'صرف آڈیو موڈ (Audio Only Mode)' : 'Audio-only mode (No video)'}
          >
            <Headphones className="w-5 h-5" />
          </button>

          {/* 6. Teacher's Choice: Whiteboard Toggle */}
          <button
            type="button"
            onClick={() => setTeachingMode(teachingMode === 'whiteboard' ? 'video' : 'whiteboard')}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
              teachingMode === 'whiteboard'
                ? 'bg-purple-600 text-white'
                : 'bg-[#3c4043] hover:bg-[#4a4e52] text-white'
            }`}
            title={language === 'ur' ? 'وائٹ بورڈ ٹول (Whiteboard)' : 'Interactive Whiteboard'}
          >
            <PenTool className="w-5 h-5" />
          </button>

          {/* 7. End Call Button (Red Pill) */}
          <button
            type="button"
            onClick={onClose}
            className="px-6 h-11 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-600/30 ms-1 sm:ms-3"
            title="Leave Call"
          >
            <PhoneOff className="w-5 h-5" />
            <span className="hidden sm:inline">{language === 'ur' ? 'کلاس ختم کریں' : 'Leave Call'}</span>
          </button>
        </div>

        {/* Right: Info, People, Chat Toggles */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Info button */}
          <button
            type="button"
            onClick={() => setActiveDrawer(activeDrawer === 'info' ? null : 'info')}
            className={`p-2.5 rounded-full transition-colors ${
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
            className={`p-2.5 rounded-full transition-colors relative ${
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
            className={`p-2.5 rounded-full transition-colors relative ${
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

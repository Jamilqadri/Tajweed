import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  CheckCircle2,
  Users,
  UserCheck,
  Video,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Layers,
  Star,
} from 'lucide-react';
import { Course } from '../../types';

interface LandingPageProps {
  onOpenAdmission: (preselectedCourseId?: string) => void;
  onOpenLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAdmission,
  onOpenLogin,
}) => {
  const { t, courses, language } = useApp();

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section
        id="home"
        className="relative pt-8 pb-16 sm:pt-14 sm:pb-24 overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 border-b border-slate-200/60"
      >
        {/* Subtle decorative geometric backdrop */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute -top-24 -end-24 w-96 h-96 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="absolute top-1/2 -start-24 w-80 h-80 rounded-full bg-sky-200/40 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-start">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-800 text-xs font-semibold border border-blue-200 shadow-xs">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>{t('trustedBadge')}</span>
              </div>

              {/* Main Title */}
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-blue-950 tracking-tight leading-none">
                  {t('heroTitle')}
                </h1>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-700 font-sans">
                  {t('heroSubtitle')}
                </h2>
              </div>

              {/* Description */}
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                {t('heroDescription')}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onOpenAdmission()}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all"
                >
                  <span>{t('heroPrimaryCta')}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-blue-900 font-bold text-base border-2 border-blue-600 shadow-sm transition-all"
                >
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>{t('heroSecondaryCta')}</span>
                </button>
              </div>

              {/* Two Class Models: Group Class (6-10) and One to One Class */}
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-200/80">
                {/* Box 1: Group Class (6 to 10) */}
                <div className="p-4 rounded-2xl bg-white border-2 border-blue-100 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200/60">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      {language === 'ur' ? 'گروپ کلاس' : 'Batch Class'}
                    </div>
                    <div className="text-lg font-black text-slate-900 leading-tight">
                      Group Class
                    </div>
                    <div className="text-xs text-slate-600 font-semibold mt-0.5 flex items-center gap-1.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                      <span>{language === 'ur' ? '6 سے 10 تک' : '6 to 10 Students'}</span>
                    </div>
                  </div>
                </div>

                {/* Box 2: One to One Class */}
                <div className="p-4 rounded-2xl bg-white border-2 border-indigo-100 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200/60">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                      {language === 'ur' ? 'انفرادی کلاس' : '1-on-1 Class'}
                    </div>
                    <div className="text-lg font-black text-slate-900 leading-tight">
                      One to One Class
                    </div>
                    <div className="text-xs text-slate-600 font-semibold mt-0.5 flex items-center gap-1.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
                      <span>{language === 'ur' ? 'مکمل انفرادی توجہ' : 'Dedicated Personal Attention'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card / Visual Showcase */}
            <div className="lg:col-span-5">
              <div className="relative bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-blue-100/80">
                <div className="absolute -top-3 -end-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  ★ Authentic Tajweed
                </div>

                <div className="text-center pb-6 border-b border-slate-100">
                  <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900">
                    Sacred Recitation & Phonetics
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Structured progression from Noorani Qaida to Advanced Tarteel
                  </p>
                </div>

                {/* Micro preview features */}
                <div className="py-4 space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/70 border border-blue-100">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 block">Automatic Student ID</span>
                      <span className="text-slate-500">e.g. 260901 with instant credentials</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center shrink-0">
                      <Video className="w-4 h-4" />
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 block">5-Min Live Classroom Unlock</span>
                      <span className="text-slate-500">📹 Join Video Class activates right before class</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 block">Double-Booking Protection</span>
                      <span className="text-slate-500">Zero scheduling conflicts for 1-on-1 teachers</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenAdmission()}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-blue-500/20"
                >
                  Enroll Today • Select Course
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT SECTION */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            About Our Academy
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t('aboutTitle')}
          </h2>
          <p className="text-base text-slate-600">
            {t('aboutSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed">
            <p className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              {t('aboutDesc1')}
            </p>
            <p className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              {t('aboutDesc2')}
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-100">
                <div className="text-xl font-bold text-blue-900 mb-1">Azhari Pedagogy</div>
                <div className="text-xs text-slate-600">Classical Shatibiyyah rules paired with modern online live correction.</div>
              </div>
              <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-100">
                <div className="text-xl font-bold text-blue-900 mb-1">Bilingual Learning</div>
                <div className="text-xs text-slate-600">Complete English and Urdu instruction tailored to your comfort.</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-400 transition-colors">
              <Award className="w-8 h-8 text-blue-600 mb-3" />
              <h4 className="font-bold text-slate-900 text-base mb-1">{t('feature1Title')}</h4>
              <p className="text-xs text-slate-600">{t('feature1Desc')}</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-400 transition-colors">
              <Layers className="w-8 h-8 text-blue-600 mb-3" />
              <h4 className="font-bold text-slate-900 text-base mb-1">{t('feature2Title')}</h4>
              <p className="text-xs text-slate-600">{t('feature2Desc')}</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-400 transition-colors">
              <Video className="w-8 h-8 text-blue-600 mb-3" />
              <h4 className="font-bold text-slate-900 text-base mb-1">{t('feature3Title')}</h4>
              <p className="text-xs text-slate-600">{t('feature3Desc')}</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-400 transition-colors">
              <CheckCircle2 className="w-8 h-8 text-blue-600 mb-3" />
              <h4 className="font-bold text-slate-900 text-base mb-1">{t('feature4Title')}</h4>
              <p className="text-xs text-slate-600">{t('feature4Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TWO TYPES OF CLASSES COMPARISON */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-3 mb-10">
            <span className="text-xs font-bold text-blue-200 uppercase tracking-widest bg-blue-700/50 px-3 py-1 rounded-full border border-blue-500/30">
              Class Architecture
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Two Tailored Learning Modalities
            </h2>
            <p className="text-sm sm:text-base text-blue-100">
              Choose the learning environment that best suits your goals and daily schedule.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Option A: Group Class */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/15 hover:bg-white/15 transition-all">
              <div className="inline-block p-3 rounded-xl bg-blue-500/30 text-blue-200 mb-4">
                <Users className="w-7 h-7" />
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-300">Option A</div>
              <h3 className="text-2xl font-bold text-white mb-2">Group Class System</h3>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed mb-6">
                Interactive group classes capped at 10 students for focused peer listening, mutual motivation, and structured fixed weekday schedules (e.g. Mon / Wed / Fri at 7:00 PM).
              </p>
              <ul className="space-y-2.5 text-xs text-blue-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Maximum 8–10 Students Per Cohort</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Affordable Monthly Tuition (from ₹500/mo)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Automatic Group Video Class link</span>
                </li>
              </ul>
            </div>

            {/* Option B: One-to-One Class */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/15 hover:bg-white/15 transition-all">
              <div className="inline-block p-3 rounded-xl bg-amber-500/30 text-amber-200 mb-4">
                <UserCheck className="w-7 h-7" />
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-300">Option B</div>
              <h3 className="text-2xl font-bold text-white mb-2">One-to-One Class System</h3>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed mb-6">
                100% individual attention with your assigned Tajweed master. The system checks teacher availability and strictly prevents double booking for uninterrupted personal pacing.
              </p>
              <ul className="space-y-2.5 text-xs text-blue-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Personalized Recitation & Accent Correction</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Strict Conflict-Free Teacher Scheduling</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Tailored Pace for Kids & Advanced Ijazah</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. COURSES CATALOG */}
      <section id="courses" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Our Academic Programs
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Curated Qur’an & Tajweed Courses
          </h2>
          <p className="text-base text-slate-600">
            From Arabic letters to deep phonetic mastery. All courses are dynamically managed by academy administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: Course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-xl hover:border-blue-400 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    {course.category || 'Tajweed'}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {course.duration}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {language === 'ur' && course.urduName ? course.urduName : course.name}
                </h3>
                {course.urduName && language === 'en' && (
                  <span className="text-xs text-blue-600 font-urdu block mb-2">
                    {course.urduName}
                  </span>
                )}

                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed line-clamp-3">
                  {language === 'ur' && course.urduDescription
                    ? course.urduDescription
                    : course.description}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Class Format:</span>
                  <span className="font-semibold text-slate-800">
                    {course.classType === 'both'
                      ? 'Group & 1-on-1'
                      : course.classType === 'one_to_one'
                      ? '1-on-1 Only'
                      : 'Group Class'}
                  </span>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">Monthly Tuition</span>
                  <span className="text-2xl font-black text-blue-900">₹{course.fee}</span>
                  <span className="text-xs text-slate-500"> / mo</span>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenAdmission(course.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-14 shadow-2xl">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-950 px-3 py-1 rounded-full border border-blue-800">
              {t('howItWorksTitle')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {t('howItWorksSubtitle')}
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Clear, transparent, and automated onboarding for every student.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 relative">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center mb-4 text-sm shadow-md">
                1
              </div>
              <h4 className="font-bold text-white text-base mb-2">{t('step1Title')}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{t('step1Desc')}</p>
            </div>

            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 relative">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center mb-4 text-sm shadow-md">
                2
              </div>
              <h4 className="font-bold text-white text-base mb-2">{t('step2Title')}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{t('step2Desc')}</p>
            </div>

            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 relative">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center mb-4 text-sm shadow-md">
                3
              </div>
              <h4 className="font-bold text-white text-base mb-2">{t('step3Title')}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{t('step3Desc')}</p>
            </div>

            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 relative">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center mb-4 text-sm shadow-md">
                4
              </div>
              <h4 className="font-bold text-white text-base mb-2">{t('step4Title')}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{t('step4Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CONTACT & INQUIRY */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-lg grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              {t('contactUs')}
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Have Questions Before Enrolling?
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Our academic coordinators are available to answer your questions about courses, placement assessment, schedules, and fee structures.
            </p>

            <div className="space-y-4 pt-2 text-sm text-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Direct Phone & WhatsApp Support</div>
                  <div className="text-slate-500">{t('phoneSupport')}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Admissions Desk Email</div>
                  <div className="text-slate-500">{t('emailSupport')}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Academy Network</div>
                  <div className="text-slate-500">{t('headquarters')}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50/70 p-6 sm:p-8 rounded-2xl border border-blue-100 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-blue-950">Ready to Begin Your Recitation Journey?</h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Click below to submit your admission form. You will immediately receive a unique Student ID and your application will be verified by the admin team.
              </p>

              <div className="p-4 bg-white rounded-xl border border-blue-200 text-xs space-y-2">
                <div className="font-bold text-blue-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Immediate Google Sheets Synchronization</span>
                </div>
                <p className="text-slate-500">
                  Every admission form is securely logged to our LMS database and synced with our Google Sheets administrative ledger.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="button"
                onClick={() => onOpenAdmission()}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>{t('applyForAdmission')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="border-t border-slate-200 pt-10 text-xs text-slate-500 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-slate-900 text-sm">KANZ UT TAJWEED</span>
          </div>
          <p>{t('footerTagline')}</p>
        </div>
        <div className="py-6 text-center text-slate-400">
          {t('footerCopyright')}
        </div>
      </footer>
    </div>
  );
};

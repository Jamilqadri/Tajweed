import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Course, ClassType } from '../../types';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  X,
} from 'lucide-react';

export const CoursesTab: React.FC = () => {
  const { courses, addCourse, updateCourse, deleteCourse, t } = useApp();

  const [isCreating, setIsCreating] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [urduName, setUrduName] = useState('');
  const [description, setDescription] = useState('');
  const [urduDescription, setUrduDescription] = useState('');
  const [fee, setFee] = useState(600);
  const [groupFee, setGroupFee] = useState(600);
  const [oneToOneFee, setOneToOneFee] = useState(1200);
  const [duration, setDuration] = useState('3 Months');
  const [category, setCategory] = useState('Tajweed');
  const [classType, setClassType] = useState<ClassType | 'both'>('both');

  const resetForm = () => {
    setName('');
    setUrduName('');
    setDescription('');
    setUrduDescription('');
    setFee(600);
    setGroupFee(600);
    setOneToOneFee(1200);
    setDuration('3 Months');
    setCategory('Tajweed');
    setClassType('both');
    setIsCreating(false);
    setEditingCourse(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const effectiveFee = classType === 'group'
      ? Number(fee)
      : classType === 'one_to_one'
      ? Number(fee)
      : Number(groupFee || fee);

    const payload = {
      name,
      urduName,
      description,
      urduDescription,
      fee: effectiveFee,
      groupFee: classType === 'both' ? Number(groupFee) : (classType === 'group' ? Number(fee) : undefined),
      oneToOneFee: classType === 'both' ? Number(oneToOneFee) : (classType === 'one_to_one' ? Number(fee) : undefined),
      duration,
      category,
      classType,
    };

    if (editingCourse) {
      updateCourse(editingCourse.id, payload);
    } else {
      addCourse({
        ...payload,
        status: 'active',
      });
    }
    resetForm();
  };

  const startEdit = (course: Course) => {
    setEditingCourse(course);
    setName(course.name);
    setUrduName(course.urduName || '');
    setDescription(course.description);
    setUrduDescription(course.urduDescription || '');
    setFee(course.fee);
    setGroupFee(course.groupFee ?? course.fee);
    setOneToOneFee(course.oneToOneFee ?? (course.fee * 2));
    setDuration(course.duration);
    setCategory(course.category || 'Tajweed');
    setClassType(course.classType);
    setIsCreating(true);
  };

  const toggleCourseStatus = (course: Course) => {
    updateCourse(course.id, {
      status: course.status === 'active' ? 'inactive' : 'active',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-bold text-slate-900">Courses Curriculum</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create and maintain Qur’anic courses, duration, pricing, and instructional modalities.
          </p>
        </div>

        {!isCreating && (
          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsCreating(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Course</span>
          </button>
        )}
      </div>

      {/* Create / Edit Form Modal */}
      {isCreating && (
        <form
          onSubmit={handleSave}
          className="bg-white p-6 rounded-2xl border-2 border-blue-200 shadow-lg space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-bold text-slate-900 text-base">
              {editingCourse ? 'Edit Course Program' : 'Add New Qur’an / Tajweed Course'}
            </h4>
            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-slate-700 p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Course Name (English) *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Basic Tajweed Course"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Course Name (Urdu)</label>
              <input
                type="text"
                dir="rtl"
                value={urduName}
                onChange={(e) => setUrduName(e.target.value)}
                placeholder="بنیادی تجوید کورس"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 font-urdu"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Course Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 3 Months / 6 Months"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900"
              >
                <option value="Tajweed">Tajweed Rules & Phonetics</option>
                <option value="Nazra">Nazra Qur’an Recitation</option>
                <option value="Hifz">Hifz / Memorization</option>
                <option value="Qiraat">Advanced Qiraat</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Class Format Availability</label>
              <select
                value={classType}
                onChange={(e) => setClassType(e.target.value as any)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900"
              >
                <option value="both">Both (Group & One-to-One)</option>
                <option value="group">Group Classes Only</option>
                <option value="one_to_one">One-to-One Only</option>
              </select>
            </div>

            {classType === 'both' ? (
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-blue-50/70 border border-blue-200">
                <div>
                  <label className="block font-bold text-blue-950 mb-1">
                    Group Class Fee (₹) / گروپ کلاس فیس *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={groupFee}
                    onChange={(e) => setGroupFee(Number(e.target.value))}
                    placeholder="e.g. 500"
                    className="w-full p-2.5 rounded-lg border border-blue-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-200"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    انفرادی طالب علموں سے گروپ کلاس کے لیے فیس
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-blue-950 mb-1">
                    One-to-One Class Fee (₹) / انفرادی کلاس فیس *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={oneToOneFee}
                    onChange={(e) => setOneToOneFee(Number(e.target.value))}
                    placeholder="e.g. 1000"
                    className="w-full p-2.5 rounded-lg border border-blue-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-200"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    خصوصی استاد کے ساتھ ون ٹو ون کلاس کی فیس
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {classType === 'group'
                    ? 'Monthly Tuition Fee (Group Class ₹) *'
                    : 'Monthly Tuition Fee (One-to-One ₹) *'}
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={fee}
                  onChange={(e) => setFee(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900"
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Course Description (English)</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed objectives and syllabus summary..."
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Course Description (Urdu)</label>
              <textarea
                rows={2}
                dir="rtl"
                value={urduDescription}
                onChange={(e) => setUrduDescription(e.target.value)}
                placeholder="کورس کی مکمل تفصیل اور نصاب..."
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 font-urdu"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
            >
              {editingCourse ? 'Update Course' : 'Save Course'}
            </button>
          </div>
        </form>
      )}

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:border-blue-400 transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {course.category}
                </span>
                <button
                  type="button"
                  onClick={() => toggleCourseStatus(course)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    course.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {course.status === 'active' ? 'Active' : 'Inactive'}
                </button>
              </div>

              <h4 className="font-bold text-slate-900 text-base">{course.name}</h4>
              {course.urduName && (
                <div className="text-xs text-blue-600 font-urdu font-semibold mt-0.5">
                  {course.urduName}
                </div>
              )}

              <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                {course.description}
              </p>

              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block">Duration</span>
                  <span className="font-semibold text-slate-800">{course.duration}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Tuition Fee</span>
                  {course.classType === 'both' && (course.groupFee || course.oneToOneFee) ? (
                    <div className="font-semibold text-blue-900 leading-tight">
                      <div>Group: <span className="font-bold">₹{course.groupFee || course.fee}</span></div>
                      <div>1-to-1: <span className="font-bold">₹{course.oneToOneFee || (course.fee * 2)}</span></div>
                    </div>
                  ) : (
                    <span className="font-bold text-blue-900">₹{course.fee}/mo</span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-medium text-slate-500">
                Format: {course.classType === 'both' ? 'Group & 1-on-1' : course.classType}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => startEdit(course)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete course ${course.name}?`)) {
                      deleteCourse(course.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

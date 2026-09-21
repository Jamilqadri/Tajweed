import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  title?: string;
}

/**
 * Imamah / Turban Icon for Male Teachers
 * Follows Lucide 24x24 geometry (stroke="currentColor", strokeWidth="2", round caps/joins)
 */
export const ImamahIcon: React.FC<IconProps> = ({
  size = 18,
  className = '',
  title,
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-label="Male Teacher (Imamah / Turban)"
    {...props}
  >
    {title && <title>{title}</title>}
    {/* Turban Upper Dome / Cap */}
    <path d="M7 11.5C7 7.35786 9.23858 4 12 4C14.7614 4 17 7.35786 17 11.5" />
    
    {/* Upper wrapped coil fold */}
    <path d="M5.5 12.5C6.5 10 9.5 9 12 9C15.5 9 17.5 10.5 18.5 12.5" />
    
    {/* Main Crossing Front Wrap (Left to Right cross) */}
    <path d="M4 14.5C5.5 13 8.5 12 12.5 13C16 13.8 19 13.5 20 14.5" />
    
    {/* Lower Base Band (Circumference around forehead) */}
    <path d="M4.5 15C4 16.2 5 17.5 7 18C9.5 18.5 14.5 18.5 17 18C19 17.5 20 16.2 19.5 15" />
    
    {/* Central Knot / Wrap fold detail */}
    <path d="M11 12.8C11.5 14.2 12.5 14.2 13 12.8" />
    
    {/* Traditional Shimla / Turban tail cloth draped down */}
    <path d="M17.5 17.5C18.5 19 19 20.5 18.5 21.5" />
  </svg>
);

/**
 * Hijab Icon for Female Teachers
 * Follows Lucide 24x24 geometry (stroke="currentColor", strokeWidth="2", round caps/joins)
 */
export const HijabIcon: React.FC<IconProps> = ({
  size = 18,
  className = '',
  title,
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-label="Female Teacher (Hijab)"
    {...props}
  >
    {title && <title>{title}</title>}
    {/* Outer Head Covering Veil (Curved crown draped down over shoulders) */}
    <path d="M12 3C7.5 3 4.5 6.8 4.5 11.5C4.5 15.5 3 19 3 21C5.5 21 8 20.5 12 20.5C16 20.5 18.5 21 21 21C21 19 19.5 15.5 19.5 11.5C19.5 6.8 16.5 3 12 3Z" />
    
    {/* Face Opening Frame (Oval framing forehead and chin) */}
    <path d="M9 10C9 8.34315 10.3431 7 12 7C13.6569 7 15 8.34315 15 10C15 12 13.8 13.8 12 14C10.2 13.8 9 12 9 10Z" />
    
    {/* Elegant Chest / Shoulder Drape fold lines */}
    <path d="M9 14.5C9 17 10.5 18.5 12 18.5C13.5 18.5 15 17 15 14.5" />
    <path d="M6 18C7.5 18.8 10 19.5 12 19.5C14 19.5 16.5 18.8 18 18" />
  </svg>
);

export interface TeacherGenderProps {
  gender?: 'male' | 'female' | string;
  teacherName?: string;
  size?: number | string;
  className?: string;
  variant?: 'icon' | 'badge' | 'chip';
  showLabel?: boolean;
}

/**
 * Determines whether teacher is male or female based on explicit gender or name indicators
 */
export function resolveTeacherGender(gender?: string, name?: string): 'male' | 'female' {
  if (gender === 'female' || gender === 'male') return gender;
  if (!name) return 'male';
  const lower = name.toLowerCase();
  if (
    lower.includes('ustadha') ||
    lower.includes('fatima') ||
    lower.includes('ayesha') ||
    lower.includes('zahra') ||
    lower.includes('maryam') ||
    lower.includes('sister') ||
    lower.includes('bano') ||
    lower.includes('begum')
  ) {
    return 'female';
  }
  return 'male';
}

/**
 * Universal Teacher Icon component:
 * - Shows Imamah/Turban icon for Male Teachers
 * - Shows Hijab icon for Female Teachers
 */
export const TeacherGenderIcon: React.FC<TeacherGenderProps> = ({
  gender,
  teacherName,
  size = 18,
  className = '',
  variant = 'icon',
  showLabel = false,
}) => {
  const resolved = resolveTeacherGender(gender, teacherName);
  const isFemale = resolved === 'female';

  if (variant === 'badge') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border transition-colors ${
          isFemale
            ? 'bg-purple-50 text-purple-800 border-purple-200'
            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
        } ${className}`}
        title={isFemale ? 'Female Teacher (Hijab)' : 'Male Teacher (Imamah / Turban)'}
      >
        {isFemale ? <HijabIcon size={size} /> : <ImamahIcon size={size} />}
        {showLabel && (
          <span>{isFemale ? 'Female Teacher' : 'Male Teacher'}</span>
        )}
      </span>
    );
  }

  if (variant === 'chip') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold shadow-2xs border ${
          isFemale
            ? 'bg-purple-50/80 text-purple-900 border-purple-200'
            : 'bg-emerald-50/80 text-emerald-900 border-emerald-200'
        } ${className}`}
        title={isFemale ? 'Female Teacher (Hijab)' : 'Male Teacher (Imamah / Turban)'}
      >
        <span
          className={`p-1 rounded-lg ${
            isFemale ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
          }`}
        >
          {isFemale ? <HijabIcon size={size} /> : <ImamahIcon size={size} />}
        </span>
        {showLabel && (
          <span>{isFemale ? 'Female (Hijab)' : 'Male (Imamah)'}</span>
        )}
      </span>
    );
  }

  // Pure icon
  return isFemale ? (
    <HijabIcon
      size={size}
      className={`text-purple-600 ${className}`}
      title="Female Teacher (Hijab)"
    />
  ) : (
    <ImamahIcon
      size={size}
      className={`text-emerald-700 ${className}`}
      title="Male Teacher (Imamah / Turban)"
    />
  );
};

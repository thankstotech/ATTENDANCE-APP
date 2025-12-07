import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AttendanceEntry, CalendarConfig } from '../types';

interface CalendarViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  entries: Record<string, AttendanceEntry>;
  activeCalendar: CalendarConfig;
  onDayClick: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ 
  currentDate, 
  onDateChange, 
  entries, 
  activeCalendar,
  onDayClick
}) => {
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const monthName = currentDate.toLocaleString('default', { month: 'short' }).toUpperCase();

  const prevMonth = () => onDateChange(new Date(year, month - 1, 1));
  const nextMonth = () => onDateChange(new Date(year, month + 1, 1));

  // Helper to format text: "TEST SITE" -> "Test site"
  const formatSiteName = (name: string) => {
    if (!name) return '';
    const lower = name.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  const renderDays = () => {
    const days = [];
    // Padding for empty start cells
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`pad-${i}`} className="h-24 bg-white border border-gray-900" />);
    }

    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const entryKey = `${activeCalendar.id}_${dateStr}`;
      const entry = entries[entryKey];

      let content = null;
      let bgColor = "bg-white";

      if (entry) {
        if (entry.isAbsent) {
          content = <span className="text-sm font-bold text-red-600">ABS</span>;
        } else {
          // Check if we have site name or OT
          const hasSite = !!entry.siteName;
          const hasOT = !!entry.otHours;

          if (hasSite || hasOT) {
             content = (
              <div className="flex flex-col items-center justify-center w-full px-0.5 mt-1">
                {hasSite && (
                  <span className="text-[11px] font-normal text-gray-900 text-center leading-tight break-words w-full line-clamp-2">
                    {formatSiteName(entry.siteName)}
                  </span>
                )}
                {hasOT && (
                  <span className="text-[9px] font-bold text-orange-600 mt-0.5">
                    OT {entry.otHours}
                  </span>
                )}
              </div>
            );
          }
        }
      }

      days.push(
        <div 
          key={d} 
          onClick={() => onDayClick(dateStr)}
          className={`h-24 border border-gray-900 relative flex flex-col cursor-pointer active:bg-blue-50 transition-colors ${bgColor}`}
        >
          {/* Date Number Top Center */}
          <div className="w-full flex justify-center pt-1">
             <span className="text-lg font-normal text-gray-900 leading-none">{d}</span>
          </div>
          
          {/* Content Middle/Center */}
          <div className="flex-1 flex items-center justify-center w-full overflow-hidden p-1">
             {content}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="flex flex-col h-full bg-white font-sans">
      {/* Custom Header matching reference */}
      <div className="flex items-center justify-between p-2 pb-4 bg-white sticky top-0 z-10">
        <button 
          onClick={prevMonth} 
          className="bg-gradient-to-b from-green-600 to-green-800 text-white px-4 py-1.5 rounded-lg shadow border-b-2 border-green-900 flex items-center font-bold text-sm active:translate-y-0.5 active:border-b-0"
        >
          <ChevronLeft size={16} className="mr-1" strokeWidth={3} />
          PREV
        </button>
        
        <h2 className="text-xl text-black font-normal tracking-wide">
          {monthName} {year}
        </h2>
        
        <button 
          onClick={nextMonth} 
          className="bg-gradient-to-b from-green-600 to-green-800 text-white px-4 py-1.5 rounded-lg shadow border-b-2 border-green-900 flex items-center font-bold text-sm active:translate-y-0.5 active:border-b-0"
        >
          NEXT
          <ChevronRight size={16} className="ml-1" strokeWidth={3} />
        </button>
      </div>

      {/* Week Header */}
      <div className="grid grid-cols-7 bg-white mb-0">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
          <div key={day} className="text-center text-sm text-black font-normal py-1 border-b-0">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 border-t border-l border-gray-900 flex-1 overflow-y-auto no-scrollbar pb-20 select-none">
        {renderDays()}
        {/* Fill remaining space with borders to complete the grid visually if needed */}
      </div>
    </div>
  );
};
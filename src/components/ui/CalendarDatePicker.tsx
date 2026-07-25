'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface CalendarDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  /** If set, dates <= minExclusive are disabled (useful for checkout: pass checkIn date) */
  minExclusive?: string;
  label?: string;
  placeholder?: string;
  blockedDates?: Set<string>;
  className?: string;
  disabled?: boolean;
  rangeStart?: string;
  rangeEnd?: string;
  /** When true, opens a two-month range calendar instead of single month */
  rangeMode?: boolean;
  /** Which phase to start in when opening in range mode (default: 'checkIn') */
  rangePhaseStart?: 'checkIn' | 'checkOut';
  /** Called with (checkIn, checkOut) when a full range is selected */
  onRangeComplete?: (checkIn: string, checkOut: string) => void;
}

export default function CalendarDatePicker({
  value,
  onChange,
  min,
  minExclusive,
  label,
  placeholder = 'Select date',
  blockedDates = new Set(),
  className,
  disabled = false,
  rangeStart,
  rangeEnd,
  rangeMode = false,
  rangePhaseStart = 'checkIn',
  onRangeComplete,
}: CalendarDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // Range mode state
  const [rangePhase, setRangePhase] = useState<'checkIn' | 'checkOut'>(rangePhaseStart);
  const [tempCheckIn, setTempCheckIn] = useState(rangeStart || '');
  const [tempCheckOut, setTempCheckOut] = useState(rangeEnd || '');
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (rangeMode) {
        setTempCheckIn(rangeStart || '');
        setTempCheckOut(rangeEnd || '');
        setRangePhase(rangePhaseStart);
      }
      if (rangeStart && !value) {
        const [y, m] = rangeStart.split('-').map(Number);
        setCurrentMonth(new Date(y, m - 1, 1));
      } else if (value) {
        const [y, m] = value.split('-').map(Number);
        setCurrentMonth(new Date(y, m - 1, 1));
      }
    }
  }, [isOpen]);

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return placeholder;
    // Parse as local date to avoid UTC timezone shift
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDateSelect = (dateStr: string) => {
    if (isDateDisabled(dateStr)) return;

    if (rangeMode) {
      if (rangePhase === 'checkIn') {
        setTempCheckIn(dateStr);
        setTempCheckOut('');
        setRangePhase('checkOut');
      } else {
        if (dateStr <= tempCheckIn) {
          setTempCheckIn(dateStr);
          setTempCheckOut('');
          setRangePhase('checkOut');
        } else {
          setTempCheckOut(dateStr);
          onRangeComplete?.(tempCheckIn, dateStr);
          setIsOpen(false);
        }
      }
    } else {
      onChange(dateStr);
      setIsOpen(false);
    }
  };

  const isDateDisabled = (dateStr: string): boolean => {
    if (blockedDates.has(dateStr)) return true;
    if (min && dateStr < min) return true;
    if (minExclusive && dateStr <= minExclusive) return true;
    return false;
  };

  const isInRange = (dateStr: string): boolean => {
    if (rangeMode) {
      const start = tempCheckIn;
      const end = tempCheckOut || (rangePhase === 'checkOut' ? hoveredDate : null);
      if (!start || !end) return false;
      if (end <= start) return false;
      return dateStr > start && dateStr < end;
    }
    if (!rangeStart || !rangeEnd) return false;
    return dateStr > rangeStart && dateStr < rangeEnd;
  };

  const isRangeStart = (dateStr: string): boolean => {
    if (rangeMode) return tempCheckIn === dateStr;
    return rangeStart === dateStr;
  };
  const isRangeEnd = (dateStr: string): boolean => {
    if (rangeMode) return tempCheckOut === dateStr;
    return rangeEnd === dateStr;
  };

  const renderCalendar = () => {
    return renderCalendarMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  };

  const renderCalendarMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSelected = value === dateStr;
      const isDisabled = isDateDisabled(dateStr);
      const isPast = dateStr < todayStr;
      const isToday = dateStr === todayStr;
      const inRange = isInRange(dateStr);
      const isStart = isRangeStart(dateStr);
      const isEnd = isRangeEnd(dateStr);

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateSelect(dateStr)}
          onMouseEnter={rangeMode && rangePhase === 'checkOut' && tempCheckIn && !isDisabled ? () => setHoveredDate(dateStr) : undefined}
          disabled={isDisabled}
          className={cn(
            'h-10 w-full flex items-center justify-center text-sm rounded-lg transition-colors',
            isSelected && !rangeMode && 'bg-brand-600 text-white font-semibold',
            (isStart || isEnd) && 'bg-brand-600 text-white font-semibold',
            inRange && !isSelected && !isStart && !isEnd && 'bg-brand-50 text-ink-900',
            !isSelected && !isDisabled && !isPast && !inRange && !isStart && !isEnd && 'hover:bg-brand-50 text-ink-900',
            isDisabled && 'bg-red-50 text-red-300 cursor-not-allowed line-through',
            isPast && !isDisabled && !inRange && !isStart && !isEnd && 'text-ink-200',
            isToday && !isSelected && !isStart && !isEnd && 'ring-2 ring-brand-500'
          )}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full px-4 border border-ink-200 rounded-xl bg-white relative',
          'hover:border-brand-500 transition-all',
          'flex items-center justify-between text-sm',
          disabled && 'opacity-50 cursor-not-allowed',
          label ? 'pt-5 pb-2' : 'py-3',
          value ? 'text-ink-900' : 'text-ink-400'
        )}
      >
        {label && (
          <span className="absolute left-4 top-1.5 text-[10px] font-semibold text-ink-500 uppercase tracking-wide pointer-events-none">
            {label}
          </span>
        )}
        <span>{formatDisplayDate(value)}</span>
        <svg className="w-5 h-5 text-ink-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {/* Calendar modal */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[100]" onClick={() => setIsOpen(false)} />
          <div
            className={cn(
              'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] p-5 bg-white rounded-2xl shadow-2xl border border-ink-100 max-w-[calc(100vw-2rem)]',
              rangeMode ? 'w-auto' : 'w-80'
            )}
            onMouseLeave={rangeMode ? () => setHoveredDate(null) : undefined}
          >
            {/* Range phase indicator */}
            {rangeMode && (
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-ink-100 text-xs">
                <span className={cn('px-3 py-1.5 rounded-lg font-medium', rangePhase === 'checkIn' ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'text-ink-500')}>
                  {tempCheckIn ? formatDisplayDate(tempCheckIn) : 'Check-in'}
                </span>
                <span className="text-ink-300">→</span>
                <span className={cn('px-3 py-1.5 rounded-lg font-medium', rangePhase === 'checkOut' ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'text-ink-500')}>
                  {tempCheckOut ? formatDisplayDate(tempCheckOut) : 'Check-out'}
                </span>
              </div>
            )}

            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                className="p-2 hover:bg-ink-50 rounded-lg transition"
              >
                <svg className="w-5 h-5 text-ink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {!rangeMode && (
                <h3 className="text-sm font-semibold text-ink-900">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
              )}
              <button
                type="button"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                className="p-2 hover:bg-ink-50 rounded-lg transition"
              >
                <svg className="w-5 h-5 text-ink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {rangeMode ? (
              /* Two-month grid for range mode */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[0, 1].map((offset) => {
                  const mDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
                  return (
                    <div key={offset} className="min-w-[280px]">
                      <h4 className="text-sm font-semibold text-ink-900 text-center mb-3">
                        {mDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h4>
                      <div className="grid grid-cols-7 gap-1 mb-1">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                          <div key={d} className="text-xs font-medium text-ink-400 text-center">{d}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {renderCalendarMonth(mDate.getFullYear(), mDate.getMonth())}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Single month for non-range mode */
              <>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="text-xs font-medium text-ink-400 text-center">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {renderCalendar()}
                </div>
              </>
            )}

            {/* Legend */}
            <div className="mt-4 pt-3 border-t border-ink-100 flex flex-wrap gap-3 text-xs text-ink-500">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-brand-600" />
                <span>Selected</span>
              </div>
              {blockedDates.size > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-red-50 border border-red-200" />
                  <span>Unavailable</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

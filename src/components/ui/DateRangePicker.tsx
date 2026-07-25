'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  checkIn: string;
  checkOut: string;
  onCheckInChange: (value: string) => void;
  onCheckOutChange: (value: string) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
  blockedDates?: Set<string>;
}

type SelectionPhase = 'checkIn' | 'checkOut';

export default function DateRangePicker({
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  label,
  className,
  disabled = false,
  blockedDates = new Set(),
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState<SelectionPhase>('checkIn');
  const [tempCheckIn, setTempCheckIn] = useState(checkIn);
  const [tempCheckOut, setTempCheckOut] = useState(checkOut);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (isOpen) {
      setTempCheckIn(checkIn);
      setTempCheckOut(checkOut);
      setPhase(checkIn ? 'checkOut' : 'checkIn');
      // Set current month to check-in date or today
      if (checkIn) {
        const [y, m] = checkIn.split('-').map(Number);
        setCurrentMonth(new Date(y, m - 1, 1));
      } else {
        const now = new Date();
        setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
      }
    }
  }, [isOpen]);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const formatDisplay = (dateStr: string, placeholder: string) => {
    if (!dateStr) return placeholder;
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleDateClick = (dateStr: string) => {
    if (phase === 'checkIn') {
      setTempCheckIn(dateStr);
      setTempCheckOut('');
      setPhase('checkOut');
    } else {
      // Check-out must be after check-in
      if (dateStr <= tempCheckIn) {
        // User clicked before check-in — reset and make this the new check-in
        setTempCheckIn(dateStr);
        setTempCheckOut('');
        setPhase('checkOut');
      } else {
        setTempCheckOut(dateStr);
        // Apply and close
        onCheckInChange(tempCheckIn);
        onCheckOutChange(dateStr);
        setIsOpen(false);
      }
    }
  };

  const isDateDisabled = (dateStr: string): boolean => {
    if (dateStr < todayStr) return true;
    if (blockedDates.has(dateStr)) return true;
    return false;
  };

  const isInRange = (dateStr: string): boolean => {
    const start = tempCheckIn;
    const end = tempCheckOut || hoveredDate;
    if (!start || !end) return false;
    if (end <= start) return false;
    return dateStr > start && dateStr < end;
  };

  const renderMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${month}-${i}`} className="h-10" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isDisabled = isDateDisabled(dateStr);
      const isStart = tempCheckIn === dateStr;
      const isEnd = tempCheckOut === dateStr;
      const inRange = isInRange(dateStr);
      const isToday = dateStr === todayStr;

      days.push(
        <button
          key={dateStr}
          type="button"
          onClick={() => !isDisabled && handleDateClick(dateStr)}
          onMouseEnter={() => phase === 'checkOut' && tempCheckIn && !isDisabled && setHoveredDate(dateStr)}
          disabled={isDisabled}
          className={cn(
            'h-10 w-full flex items-center justify-center text-sm rounded-lg transition-colors',
            isStart && 'bg-ink-900 text-white font-semibold',
            isEnd && 'bg-ink-900 text-white font-semibold',
            inRange && !isStart && !isEnd && 'bg-ink-100 text-ink-900',
            !isStart && !isEnd && !inRange && !isDisabled && 'hover:bg-ink-50 text-ink-900',
            isDisabled && 'text-ink-200 cursor-not-allowed',
            isToday && !isStart && !isEnd && 'ring-1 ring-ink-300'
          )}
        >
          {day}
        </button>
      );
    }

    return (
      <div>
        <h4 className="text-sm font-semibold text-ink-900 text-center mb-3">
          {new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h4>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="text-xs font-medium text-ink-400 text-center">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
  };

  const month1Year = currentMonth.getFullYear();
  const month1Month = currentMonth.getMonth();
  const month2Date = new Date(month1Year, month1Month + 1, 1);

  return (
    <div className={cn('relative', className)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        className={cn(
          'w-full px-4 border border-ink-200 rounded-xl bg-white',
          'hover:border-brand-500 transition-all',
          'flex items-center gap-2 text-sm',
          disabled && 'opacity-50 cursor-not-allowed',
          label ? 'pt-5 pb-2' : 'py-3',
        )}
      >
        {label && (
          <span className="absolute left-4 top-1.5 text-[10px] font-semibold text-ink-500 uppercase tracking-wide pointer-events-none">
            {label}
          </span>
        )}
        <span className={cn(checkIn ? 'text-ink-900 font-medium' : 'text-ink-400')}>
          {formatDisplay(checkIn, 'Check-in')}
        </span>
        <svg className="w-4 h-4 text-ink-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
        <span className={cn(checkOut ? 'text-ink-900 font-medium' : 'text-ink-400')}>
          {formatDisplay(checkOut, 'Check-out')}
        </span>
        <svg className="w-5 h-5 text-ink-400 shrink-0 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {/* Modal */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[100]" onClick={() => setIsOpen(false)} />
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] p-5 sm:p-6 bg-white rounded-2xl shadow-2xl border border-ink-100 w-[calc(100vw-2rem)] sm:w-auto max-h-[90vh] overflow-y-auto"
            onMouseLeave={() => setHoveredDate(null)}
          >
            {/* Phase indicator */}
            <div className="flex items-center gap-4 mb-5 pb-4 border-b border-ink-100">
              <button
                type="button"
                onClick={() => { setPhase('checkIn'); setTempCheckOut(''); }}
                className={cn(
                  'flex-1 text-center py-2 rounded-xl text-sm font-medium transition-colors',
                  phase === 'checkIn' ? 'bg-ink-900 text-white' : 'bg-ink-50 text-ink-600 hover:bg-ink-100'
                )}
              >
                {tempCheckIn ? formatDisplay(tempCheckIn, 'Check-in') : 'Check-in'}
              </button>
              <svg className="w-4 h-4 text-ink-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <button
                type="button"
                onClick={() => tempCheckIn && setPhase('checkOut')}
                className={cn(
                  'flex-1 text-center py-2 rounded-xl text-sm font-medium transition-colors',
                  phase === 'checkOut' ? 'bg-ink-900 text-white' : 'bg-ink-50 text-ink-600 hover:bg-ink-100',
                  !tempCheckIn && 'opacity-50 cursor-not-allowed'
                )}
              >
                {tempCheckOut ? formatDisplay(tempCheckOut, 'Check-out') : 'Check-out'}
              </button>
            </div>

            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setCurrentMonth(new Date(month1Year, month1Month - 1, 1))}
                className="p-2 hover:bg-ink-50 rounded-lg transition"
              >
                <svg className="w-5 h-5 text-ink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="text-sm font-medium text-ink-500">
                {phase === 'checkIn' ? 'Select check-in date' : 'Select check-out date'}
              </div>
              <button
                type="button"
                onClick={() => setCurrentMonth(new Date(month1Year, month1Month + 1, 1))}
                className="p-2 hover:bg-ink-50 rounded-lg transition"
              >
                <svg className="w-5 h-5 text-ink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Two-month grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              {renderMonth(month1Year, month1Month)}
              {renderMonth(month2Date.getFullYear(), month2Date.getMonth())}
            </div>

            {/* Footer */}
            <div className="mt-5 pt-4 border-t border-ink-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setTempCheckIn('');
                  setTempCheckOut('');
                  setPhase('checkIn');
                }}
                className="text-sm font-medium text-ink-500 hover:text-ink-700 underline"
              >
                Clear dates
              </button>
              {tempCheckIn && tempCheckOut && (
                <span className="text-xs text-ink-500">
                  {Math.ceil((new Date(tempCheckOut).getTime() - new Date(tempCheckIn).getTime()) / 86400000)} nights
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

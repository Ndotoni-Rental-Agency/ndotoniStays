'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  checkIn: string;
  checkOut: string;
  onCheckInChange: (value: string) => void;
  onCheckOutChange: (value: string) => void;
  checkInLabel?: string;
  checkOutLabel?: string;
  checkInPlaceholder?: string;
  checkOutPlaceholder?: string;
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
  checkInLabel = 'Check-in',
  checkOutLabel = 'Check-out',
  checkInPlaceholder = 'Add date',
  checkOutPlaceholder = 'Add date',
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
      // Set current month based on existing selection or today
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

  const formatDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const openPicker = (startPhase: SelectionPhase) => {
    if (disabled) return;
    setPhase(startPhase);
    setIsOpen(true);
  };

  const handleDateClick = (dateStr: string) => {
    if (phase === 'checkIn') {
      setTempCheckIn(dateStr);
      setTempCheckOut('');
      setPhase('checkOut');
    } else {
      if (dateStr <= tempCheckIn) {
        // Clicked before check-in — reset
        setTempCheckIn(dateStr);
        setTempCheckOut('');
        setPhase('checkOut');
      } else {
        setTempCheckOut(dateStr);
        // Apply both and close
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
    const end = tempCheckOut || (phase === 'checkOut' ? hoveredDate : null);
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
      days.push(<div key={`empty-${month}-${i}`} className="h-9" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isDisabled = isDateDisabled(dateStr);
      const isStart = tempCheckIn === dateStr;
      const isEnd = tempCheckOut === dateStr;
      const inRange = isInRange(dateStr);
      const isToday = dateStr === todayStr;
      const isPast = dateStr < todayStr;

      days.push(
        <button
          key={dateStr}
          type="button"
          onClick={() => !isDisabled && handleDateClick(dateStr)}
          onMouseEnter={() => phase === 'checkOut' && tempCheckIn && !isDisabled && setHoveredDate(dateStr)}
          disabled={isDisabled}
          className={cn(
            'h-9 w-full flex items-center justify-center text-sm rounded-lg transition-colors',
            (isStart || isEnd) && 'bg-brand-600 text-white font-semibold',
            inRange && !isStart && !isEnd && 'bg-brand-50 text-ink-900',
            !isStart && !isEnd && !inRange && !isDisabled && !isPast && 'hover:bg-brand-50 text-ink-900',
            isDisabled && 'bg-red-50 text-red-300 cursor-not-allowed line-through',
            isPast && !isDisabled && !inRange && !isStart && !isEnd && 'text-ink-200',
            isToday && !isStart && !isEnd && 'ring-2 ring-brand-500'
          )}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="min-w-[280px]">
        <h4 className="text-sm font-semibold text-ink-900 text-center mb-3">
          {new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h4>
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="text-xs font-medium text-ink-400 text-center py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {days}
        </div>
      </div>
    );
  };

  const month1Year = currentMonth.getFullYear();
  const month1Month = currentMonth.getMonth();
  const month2Date = new Date(month1Year, month1Month + 1, 1);

  const nights = tempCheckIn && tempCheckOut
    ? Math.ceil((new Date(tempCheckOut).getTime() - new Date(tempCheckIn).getTime()) / 86400000)
    : 0;

  return (
    <div className={cn('flex gap-2 sm:gap-3', className)}>
      {/* Check-in trigger */}
      <div className="flex-1 min-w-0">
        {checkInLabel && (
          <label className="block text-xs font-medium text-ink-500 mb-1">{checkInLabel}</label>
        )}
        <button
          type="button"
          onClick={() => openPicker('checkIn')}
          disabled={disabled}
          className={cn(
            'w-full px-3 py-2.5 border border-ink-200 rounded-xl bg-white',
            'hover:border-brand-500 transition-all',
            'flex items-center justify-between text-sm',
            disabled && 'opacity-50 cursor-not-allowed',
            checkIn ? 'text-ink-900' : 'text-ink-400'
          )}
        >
          <span>{checkIn ? formatDisplay(checkIn) : checkInPlaceholder}</span>
          <svg className="w-4 h-4 text-ink-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {/* Check-out trigger */}
      <div className="flex-1 min-w-0">
        {checkOutLabel && (
          <label className="block text-xs font-medium text-ink-500 mb-1">{checkOutLabel}</label>
        )}
        <button
          type="button"
          onClick={() => openPicker(checkIn ? 'checkOut' : 'checkIn')}
          disabled={disabled}
          className={cn(
            'w-full px-3 py-2.5 border border-ink-200 rounded-xl bg-white',
            'hover:border-brand-500 transition-all',
            'flex items-center justify-between text-sm',
            disabled && 'opacity-50 cursor-not-allowed',
            checkOut ? 'text-ink-900' : 'text-ink-400'
          )}
        >
          <span>{checkOut ? formatDisplay(checkOut) : checkOutPlaceholder}</span>
          <svg className="w-4 h-4 text-ink-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {/* Range calendar modal */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[100]" onClick={() => setIsOpen(false)} />
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] p-5 bg-white rounded-2xl shadow-2xl border border-ink-100 w-[calc(100vw-2rem)] sm:w-auto max-h-[90vh] overflow-y-auto"
            onMouseLeave={() => setHoveredDate(null)}
          >
            {/* Header with phase tabs */}
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-ink-100">
              <button
                type="button"
                onClick={() => { setPhase('checkIn'); setTempCheckOut(''); }}
                className={cn(
                  'flex-1 text-center py-2 px-3 rounded-xl text-sm font-medium transition-colors border',
                  phase === 'checkIn'
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-ink-200 bg-white text-ink-600 hover:bg-ink-50'
                )}
              >
                <span className="block text-[10px] uppercase text-ink-400 font-semibold mb-0.5">{checkInLabel}</span>
                {tempCheckIn ? formatDisplay(tempCheckIn) : checkInPlaceholder}
              </button>
              <svg className="w-4 h-4 text-ink-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <button
                type="button"
                onClick={() => tempCheckIn && setPhase('checkOut')}
                className={cn(
                  'flex-1 text-center py-2 px-3 rounded-xl text-sm font-medium transition-colors border',
                  phase === 'checkOut'
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-ink-200 bg-white text-ink-600 hover:bg-ink-50',
                  !tempCheckIn && 'opacity-50 cursor-not-allowed'
                )}
              >
                <span className="block text-[10px] uppercase text-ink-400 font-semibold mb-0.5">{checkOutLabel}</span>
                {tempCheckOut ? formatDisplay(tempCheckOut) : checkOutPlaceholder}
              </button>
            </div>

            {/* Month navigation */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => setCurrentMonth(new Date(month1Year, month1Month - 1, 1))}
                className="p-2 hover:bg-ink-50 rounded-lg transition"
              >
                <svg className="w-5 h-5 text-ink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-xs text-ink-500 font-medium">
                {phase === 'checkIn' ? 'Select check-in date' : 'Select check-out date'}
              </span>
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

            {/* Two-month calendar grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {renderMonth(month1Year, month1Month)}
              {renderMonth(month2Date.getFullYear(), month2Date.getMonth())}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-ink-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setTempCheckIn('');
                  setTempCheckOut('');
                  onCheckInChange('');
                  onCheckOutChange('');
                  setPhase('checkIn');
                }}
                className="text-sm font-medium text-ink-500 hover:text-ink-700 underline"
              >
                Clear dates
              </button>
              <div className="flex items-center gap-3">
                {nights > 0 && (
                  <span className="text-xs text-ink-500">{nights} night{nights !== 1 ? 's' : ''}</span>
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-ink-500">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-brand-600" />
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-brand-50 border border-brand-200" />
                <span>In range</span>
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

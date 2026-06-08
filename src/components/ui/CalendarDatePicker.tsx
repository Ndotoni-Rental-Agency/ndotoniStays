'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface CalendarDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  label?: string;
  placeholder?: string;
  blockedDates?: Set<string>;
  className?: string;
  disabled?: boolean;
  rangeStart?: string;
  rangeEnd?: string;
}

export default function CalendarDatePicker({
  value,
  onChange,
  min,
  label,
  placeholder = 'Select date',
  blockedDates = new Set(),
  className,
  disabled = false,
  rangeStart,
  rangeEnd,
}: CalendarDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (rangeStart && !value) {
        // Parse as local date to avoid timezone shift
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
    if (!isDateDisabled(dateStr)) {
      onChange(dateStr);
      setIsOpen(false);
    }
  };

  const isDateDisabled = (dateStr: string): boolean => {
    if (blockedDates.has(dateStr)) return true;
    if (min && dateStr < min) return true;
    return false;
  };

  const isInRange = (dateStr: string): boolean => {
    if (!rangeStart || !rangeEnd) return false;
    return dateStr > rangeStart && dateStr < rangeEnd;
  };

  const isRangeStart = (dateStr: string): boolean => rangeStart === dateStr;
  const isRangeEnd = (dateStr: string): boolean => rangeEnd === dateStr;

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const today = new Date().toISOString().split('T')[0];

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSelected = value === dateStr;
      const isDisabled = isDateDisabled(dateStr);
      const isPast = dateStr < today;
      const isToday = dateStr === today;
      const inRange = isInRange(dateStr);
      const isStart = isRangeStart(dateStr);
      const isEnd = isRangeEnd(dateStr);

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateSelect(dateStr)}
          disabled={isDisabled}
          className={cn(
            'h-10 w-full flex items-center justify-center text-sm rounded-lg transition-colors',
            isSelected && 'bg-brand-600 text-white font-semibold',
            (isStart || isEnd) && !isSelected && 'bg-brand-600 text-white font-semibold',
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
      {label && (
        <label className="block text-xs font-medium text-ink-500 mb-1">{label}</label>
      )}

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full px-4 py-3 border border-ink-200 rounded-xl bg-white',
          'hover:border-brand-500 transition-all',
          'flex items-center justify-between text-sm',
          disabled && 'opacity-50 cursor-not-allowed',
          value ? 'text-ink-900' : 'text-ink-400'
        )}
      >
        <span>{formatDisplayDate(value)}</span>
        <svg className="w-5 h-5 text-ink-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {/* Calendar modal */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[100]" onClick={() => setIsOpen(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] p-5 bg-white rounded-2xl shadow-2xl border border-ink-100 w-80 max-w-[calc(100vw-2rem)]">
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
              <h3 className="text-sm font-semibold text-ink-900">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
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

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-xs font-medium text-ink-400 text-center">
                  {day}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>

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

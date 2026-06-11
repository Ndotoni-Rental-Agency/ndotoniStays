'use client';

import { useState, useEffect, useCallback } from 'react';
import { GraphQLClient } from '@/lib/graphql-client';
import { getBlockedDates } from '@/graphql/queries';
import { blockDates, unblockDates } from '@/graphql/mutations';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Props {
  propertyId: string;
}

export function HostCalendar({ propertyId }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'block' | 'unblock'>('block');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reason, setReason] = useState('');

  const fetchBlocked = useCallback(async () => {
    try {
      setLoading(true);
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        .toISOString().split('T')[0];
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 2, 0)
        .toISOString().split('T')[0];

      const data = await GraphQLClient.executeAuthenticated<{
        getBlockedDates: { blockedRanges: Array<{ startDate: string; endDate: string; reason?: string }> };
      }>(getBlockedDates, { propertyId, startDate, endDate });

      const blocked = new Set<string>();
      for (const range of data.getBlockedDates?.blockedRanges || []) {
        const start = new Date(range.startDate + 'T00:00:00');
        const end = new Date(range.endDate + 'T00:00:00');
        const cursor = new Date(start);
        while (cursor <= end) {
          blocked.add(cursor.toISOString().split('T')[0]);
          cursor.setDate(cursor.getDate() + 1);
        }
      }
      setBlockedDates(blocked);
    } catch (err) {
      console.error('Failed to fetch blocked dates:', err);
    } finally {
      setLoading(false);
    }
  }, [propertyId, currentMonth]);

  useEffect(() => {
    fetchBlocked();
  }, [fetchBlocked]);

  function handleDateClick(dateStr: string) {
    const today = new Date().toISOString().split('T')[0];
    if (dateStr < today) return;

    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(dateStr)) {
        next.delete(dateStr);
      } else {
        next.add(dateStr);
      }
      return next;
    });

    // Auto-detect mode: if clicking a blocked date, switch to unblock mode
    if (!isSelecting) {
      setSelectionMode(blockedDates.has(dateStr) ? 'unblock' : 'block');
      setIsSelecting(true);
    }
  }

  function clearSelection() {
    setSelectedDates(new Set());
    setIsSelecting(false);
    setReason('');
  }

  async function handleSave() {
    if (selectedDates.size === 0) return;

    setSaving(true);
    try {
      const sortedDates = Array.from(selectedDates).sort();
      const startDate = sortedDates[0];
      const endDate = sortedDates[sortedDates.length - 1];

      if (selectionMode === 'block') {
        await GraphQLClient.executeAuthenticated(blockDates, {
          input: { propertyId, startDate, endDate, reason: reason || undefined },
        });
        // Update local state
        setBlockedDates((prev) => {
          const next = new Set(prev);
          for (const d of sortedDates) next.add(d);
          return next;
        });
        toast.success(`Blocked ${sortedDates.length} date${sortedDates.length > 1 ? 's' : ''}`);
      } else {
        await GraphQLClient.executeAuthenticated(unblockDates, {
          input: { propertyId, startDate, endDate },
        });
        setBlockedDates((prev) => {
          const next = new Set(prev);
          for (const d of sortedDates) next.delete(d);
          return next;
        });
        toast.success(`Unblocked ${sortedDates.length} date${sortedDates.length > 1 ? 's' : ''}`);
      }

      clearSelection();
    } catch (err: any) {
      console.error('Failed to save dates:', err);
      toast.error(err?.message || 'Failed to update calendar');
    } finally {
      setSaving(false);
    }
  }

  function renderMonth(monthOffset: number) {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + monthOffset;
    const display = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDay = new Date(year, month, 1).getDay();
    const today = new Date().toISOString().split('T')[0];

    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`e-${monthOffset}-${i}`} className="h-10" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const m = display.getMonth();
      const y = display.getFullYear();
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isPast = dateStr < today;
      const isBlocked = blockedDates.has(dateStr);
      const isSelected = selectedDates.has(dateStr);
      const isToday = dateStr === today;

      days.push(
        <button
          key={dateStr}
          type="button"
          disabled={isPast}
          onClick={() => handleDateClick(dateStr)}
          className={cn(
            'h-10 w-full flex items-center justify-center text-sm rounded-lg transition-all relative',
            isPast && 'text-ink-200 cursor-not-allowed',
            !isPast && !isBlocked && !isSelected && 'hover:bg-ink-50 text-ink-800',
            isBlocked && !isSelected && 'bg-red-100 text-red-700 font-medium',
            isSelected && selectionMode === 'block' && 'bg-red-500 text-white font-semibold ring-2 ring-red-300',
            isSelected && selectionMode === 'unblock' && 'bg-green-500 text-white font-semibold ring-2 ring-green-300',
            isToday && !isSelected && !isBlocked && 'ring-2 ring-brand-500 font-semibold'
          )}
        >
          {day}
        </button>
      );
    }

    return (
      <div>
        <h3 className="text-sm font-semibold text-ink-800 mb-3 text-center">
          {display.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d} className="text-xs font-medium text-ink-400 text-center py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">{days}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-ink-50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-ink-800 mb-1">Manage your availability</h3>
        <p className="text-xs text-ink-500">
          Click dates to block or unblock them. Blocked dates won't accept bookings.
          Select multiple dates, then save.
        </p>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
          className="p-2 hover:bg-ink-50 rounded-lg transition"
        >
          <svg className="w-5 h-5 text-ink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setCurrentMonth(new Date())}
          className="text-sm text-brand-600 font-medium hover:underline"
        >
          Today
        </button>
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

      {/* Two-month view */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-ink-100 rounded w-1/3 mx-auto" />
            <div className="h-64 bg-ink-50 rounded-xl" />
          </div>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-ink-100 rounded w-1/3 mx-auto" />
            <div className="h-64 bg-ink-50 rounded-xl" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {renderMonth(0)}
          {renderMonth(1)}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-ink-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-100 border border-red-200" />
          <span>Blocked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span>Selecting to block</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>Selecting to unblock</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded ring-2 ring-brand-500" />
          <span>Today</span>
        </div>
      </div>

      {/* Selection action bar */}
      {isSelecting && selectedDates.size > 0 && (
        <div className="sticky bottom-4 bg-white border border-ink-200 shadow-xl rounded-2xl p-4 flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink-800">
              {selectedDates.size} date{selectedDates.size > 1 ? 's' : ''} selected
              <span className={cn(
                'ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                selectionMode === 'block' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              )}>
                {selectionMode === 'block' ? 'Blocking' : 'Unblocking'}
              </span>
            </p>
            {selectionMode === 'block' && (
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason (optional) — e.g. Personal use, Maintenance"
                className="mt-2 input text-sm py-2 w-full max-w-sm"
              />
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={clearSelection}
              className="btn-secondary text-sm py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={cn(
                'text-sm py-2 px-5 rounded-xl font-medium text-white transition-colors',
                selectionMode === 'block'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700',
                saving && 'opacity-50 cursor-not-allowed'
              )}
            >
              {saving
                ? 'Saving...'
                : selectionMode === 'block'
                  ? 'Block Dates'
                  : 'Unblock Dates'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

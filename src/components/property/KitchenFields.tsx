'use client';
import { useId } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export type KitchenValue = { kitchenCount: number | null; kitchenAccess: string | null };
export default function KitchenFields({ count, access, onChange }: { count?: string | number | null; access?: string | null; onChange: (value: KitchenValue) => void }) {
  const { language } = useLanguage();
  const sw = language === 'sw';
  const id = useId();
  const number = count === '' || count == null ? null : Number(count);
  const many = number != null && number >= 2;
  return <fieldset className="space-y-3 rounded-xl border border-gray-200 p-4">
    <legend className="px-1 text-base font-semibold">{sw ? 'Jiko' : 'Kitchen'}</legend>
    <label htmlFor={id} className="block text-sm font-medium">{sw ? 'Idadi ya majiko' : 'Number of kitchens'}</label>
    <select id={id} value={number == null ? '' : many ? 'many' : String(number)} onChange={e => { const next = e.target.value === '' ? null : e.target.value === 'many' ? 2 : Number(e.target.value); onChange({ kitchenCount: next, kitchenAccess: next != null && next > 0 ? access || null : null }); }} className="min-h-12 w-full rounded-xl border border-gray-300 bg-white px-3 text-base text-gray-900">
      <option value="">{sw ? 'Haijabainishwa' : 'Not specified'}</option><option value="0">{sw ? 'Hakuna jiko' : 'No kitchen'}</option><option value="1">{sw ? 'Jiko 1' : '1 kitchen'}</option><option value="many">{sw ? 'Majiko 2 au zaidi' : '2 or more kitchens'}</option>
    </select>
    {many && <label className="block text-sm font-medium">{sw ? 'Majiko mangapi?' : 'How many kitchens?'}<input type="number" min={2} max={100} step={1} value={number} onChange={e => { const n = Number(e.target.value); if (Number.isInteger(n) && n >= 2 && n <= 100) onChange({ kitchenCount: n, kitchenAccess: access || null }); }} className="mt-2 min-h-12 w-full rounded-xl border border-gray-300 bg-white px-3 text-base text-gray-900" /></label>}
    {number != null && number > 0 && <label className="block text-sm font-medium">{sw ? 'Matumizi ya jiko' : 'Kitchen access'}<select value={access || ''} onChange={e => onChange({ kitchenCount: number, kitchenAccess: e.target.value || null })} className="mt-2 min-h-12 w-full rounded-xl border border-gray-300 bg-white px-3 text-base text-gray-900"><option value="">{sw ? 'Haijabainishwa' : 'Not specified'}</option><option value="PRIVATE">{sw ? 'Jiko binafsi' : 'Private kitchen'}</option><option value="SHARED">{sw ? 'Jiko la pamoja' : 'Shared kitchen access'}</option></select></label>}
  </fieldset>;
}

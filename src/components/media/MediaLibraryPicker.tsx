'use client';

import { useEffect, useState } from 'react';
import { CheckIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { PlayIcon } from '@heroicons/react/24/solid';
import { useLanguage } from '@/contexts/LanguageContext';
import { GraphQLClient } from '@/lib/graphql-client';
import { getMediaLibrary } from '@/graphql/queries';
import { GetMediaLibraryQuery } from '@/API';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (images: string[], videos: string[]) => void;
}

type LibraryItem = { url: string; type: 'image' | 'video' };

/** Lets a host reuse photos/videos they've already uploaded instead of re-uploading. */
export function MediaLibraryPicker({ isOpen, onClose, onAdd }: Props) {
  const { t } = useLanguage();
  const [items, setItems] = useState<LibraryItem[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isOpen) return;
    setSelected(new Set());
    (async () => {
      try {
        const data = await GraphQLClient.executeAuthenticated<GetMediaLibraryQuery>(getMediaLibrary, {});
        const media = data.getMediaLibrary?.media;
        const images: LibraryItem[] = (media?.images || []).map((url) => ({ url, type: 'image' as const }));
        const videos: LibraryItem[] = (media?.videos || []).map((url) => ({ url, type: 'video' as const }));
        setItems([...images, ...videos]);
      } catch (err) {
        console.error('Failed to load media library:', err);
        setItems([]);
      }
    })();
  }, [isOpen]);

  if (!isOpen) return null;

  function toggle(url: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url); else next.add(url);
      return next;
    });
  }

  function handleAdd() {
    const images = (items || []).filter((i) => i.type === 'image' && selected.has(i.url)).map((i) => i.url);
    const videos = (items || []).filter((i) => i.type === 'video' && selected.has(i.url)).map((i) => i.url);
    onAdd(images, videos);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 sm:p-6 border-b border-ink-100">
          <h3 className="text-lg font-semibold text-ink-900">{t('addUnit.mediaPicker.title')}</h3>
          <p className="text-sm text-ink-500 mt-1">{t('addUnit.mediaPicker.subtitle')}</p>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {items === null ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square rounded-xl bg-ink-100 animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-10">
              <PhotoIcon className="h-10 w-10 text-ink-200 mx-auto mb-3" />
              <p className="text-sm text-ink-500">{t('addUnit.mediaPicker.empty')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {items.map((item) => {
                const isSelected = selected.has(item.url);
                return (
                  <button
                    key={item.url}
                    type="button"
                    onClick={() => toggle(item.url)}
                    className={`relative aspect-square rounded-xl overflow-hidden bg-ink-100 border-2 transition-colors ${
                      isSelected ? 'border-brand-600' : 'border-transparent hover:border-ink-200'
                    }`}
                  >
                    {item.type === 'image' ? (
                      <img src={item.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <video src={item.url} className="w-full h-full object-cover pointer-events-none" preload="metadata" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <PlayIcon className="h-6 w-6 text-white/90" />
                        </div>
                      </>
                    )}
                    <div className={`absolute inset-0 transition-colors ${isSelected ? 'bg-brand-600/20' : ''}`} />
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-brand-600 flex items-center justify-center">
                        <CheckIcon className="h-3 w-3 text-white" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5 border-t border-ink-100 flex items-center justify-between">
          <span className="text-sm text-ink-500">
            {selected.size > 0 ? t('addUnit.mediaPicker.selected').replace('{count}', String(selected.size)) : ''}
          </span>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-secondary text-sm px-4 py-2">
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={selected.size === 0}
              className="btn-primary text-sm px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t('addUnit.mediaPicker.add')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

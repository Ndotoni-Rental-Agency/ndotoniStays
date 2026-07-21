import React from 'react';
import Link from 'next/link';

const NDOTONI_DOMAIN = 'ndotonistays.com';

/**
 * Renders text with clickable links.
 * Internal property links use Next.js Link, external links open in new tabs.
 */
export function renderTextWithLinks(text: string): React.ReactNode {
  if (!text) return text;

  const parts: Array<{
    text: string;
    isLink: boolean;
    type?: 'internal' | 'external';
    url?: string;
  }> = [];

  const LINK_REGEX = /(https?:\/\/[^\s]+|\/property\/[a-zA-Z0-9-]+)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = LINK_REGEX.exec(text)) !== null) {
    const start = match.index;
    const rawUrl = match[0];

    if (start > lastIndex) {
      parts.push({ text: text.slice(lastIndex, start), isLink: false });
    }

    const internalPropertyMatch = rawUrl.match(/\/property\/[a-zA-Z0-9-]+$/);

    if (
      internalPropertyMatch &&
      (rawUrl.startsWith('/property') || rawUrl.includes(NDOTONI_DOMAIN) || rawUrl.includes('ndotoni.com'))
    ) {
      parts.push({ text: rawUrl, isLink: true, type: 'internal', url: internalPropertyMatch[0] });
    } else {
      parts.push({ text: rawUrl, isLink: true, type: 'external', url: rawUrl });
    }

    lastIndex = start + rawUrl.length;
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), isLink: false });
  }

  const linkClasses =
    'text-blue-300 hover:text-blue-200 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2 transition-colors font-medium';

  return parts.map((part, index) => {
    if (!part.isLink) {
      return <span key={index}>{part.text}</span>;
    }

    if (part.type === 'internal') {
      return (
        <Link
          key={index}
          href={part.url!}
          className={linkClasses}
          target="_blank"
          rel="noopener noreferrer"
          title="View property details"
        >
          {part.text}
        </Link>
      );
    }

    return (
      <a
        key={index}
        href={part.url!}
        className={linkClasses}
        target="_blank"
        rel="noopener noreferrer"
      >
        {part.text}
      </a>
    );
  });
}

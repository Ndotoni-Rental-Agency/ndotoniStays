import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Lightbulb } from 'lucide-react';
import type { Block } from '@/app/blog/posts';

// Renders the tiny inline markup used in posts: **bold** and [text](href). No raw HTML.
export function Inline({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;
  let last = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1]) parts.push(<strong key={m.index} className="font-semibold text-ink-900">{m[1]}</strong>);
    else {
      const href = m[3];
      const cls = 'font-semibold text-brand-700 underline decoration-brand-300 underline-offset-4 hover:decoration-brand-600';
      parts.push(href.startsWith('/') ? <Link key={m.index} href={href} className={cls}>{m[2]}</Link> : <a key={m.index} href={href} className={cls} target="_blank" rel="noopener noreferrer">{m[2]}</a>);
    }
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts.map((p, i) => <Fragment key={i}>{p}</Fragment>)}</>;
}

export function ArticleBlock({ block }: { block: Block }) {
  if ('p' in block) return <p className="text-[17px] leading-8 text-ink-700"><Inline text={block.p} /></p>;
  if ('list' in block) {
    const Tag = block.ordered ? 'ol' : 'ul';
    return <Tag className={`space-y-3 pl-6 text-[17px] leading-8 text-ink-700 marker:font-semibold marker:text-brand-600 ${block.ordered ? 'list-decimal' : 'list-disc'}`}>
      {block.list.map(item => <li key={item} className="pl-1"><Inline text={item} /></li>)}
    </Tag>;
  }
  if ('checklist' in block) return <ul className="divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-white">
    {block.checklist.map(item => <li key={item} className="flex gap-3 px-4 py-3.5 text-[16px] leading-7 text-ink-700 sm:px-5">
      <CheckCircle2 aria-hidden="true" className="mt-1 h-5 w-5 flex-none text-brand-600" /><span><Inline text={item} /></span>
    </li>)}
  </ul>;
  if ('tip' in block || 'warn' in block) {
    const warn = 'warn' in block;
    const Icon = warn ? AlertTriangle : Lightbulb;
    return <aside className={`flex gap-4 rounded-2xl p-5 sm:p-6 ${warn ? 'bg-amber-50 text-amber-950' : 'bg-brand-50 text-ink-800'}`}>
      <Icon aria-hidden="true" className={`mt-0.5 h-5 w-5 flex-none ${warn ? 'text-amber-600' : 'text-brand-600'}`} />
      <div>{block.title && <p className="mb-1 font-semibold">{block.title}</p>}<p className="leading-7"><Inline text={warn ? block.warn : block.tip} /></p></div>
    </aside>;
  }
  const { head, rows, caption } = block.table;
  return <figure>
    <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
      <table className="w-full min-w-[480px] text-left text-[15px]">
        <thead className="bg-ink-50 text-xs uppercase tracking-wider text-ink-500"><tr>{head.map(h => <th key={h} scope="col" className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-ink-100">{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className={`px-4 py-3 align-top leading-6 ${j === 0 ? 'text-ink-900' : 'text-ink-700'}`}>{c ? <Inline text={c} /> : <span className="text-ink-300">—</span>}</td>)}</tr>)}</tbody>
      </table>
    </div>
    {caption && <figcaption className="mt-2 text-sm text-ink-500">{caption}</figcaption>}
  </figure>;
}

export function ArticleSections({ sections }: { sections: { title: string; blocks: Block[] }[] }) {
  return <>{sections.map((s, i) => <section key={s.title} id={`section-${i + 1}`} aria-labelledby={`section-${i + 1}-title`} className="scroll-mt-28 pt-10">
    <h2 id={`section-${i + 1}-title`} className="mb-5 text-2xl font-bold leading-tight tracking-tight text-ink-900 sm:text-[28px]">{s.title}</h2>
    <div className="space-y-6">{s.blocks.map((b, j) => <ArticleBlock key={j} block={b} />)}</div>
  </section>)}</>;
}

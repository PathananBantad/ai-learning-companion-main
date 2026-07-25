import React from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface ChatMarkdownProps {
  text: string;
}

// Shared renderer for AI/student chat bubbles. Keeps typography compact (text-xs)
// to match the existing bubble design, and relies on `currentColor` for borders /
// markers so it looks right on both the light AI bubble and the blue student bubble.
const components: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
  ul: ({ children }) => (
    <ul className="list-disc pl-4 mb-2 space-y-1 marker:text-current/60">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-4 mb-2 space-y-1 marker:text-current/60">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => <del className="opacity-70">{children}</del>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline underline-offset-2 hover:opacity-80"
    >
      {children}
    </a>
  ),
  h1: ({ children }) => (
    <h1 className="font-display font-bold text-sm mb-1.5 mt-2 first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-display font-bold text-[13px] mb-1.5 mt-2 first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-display font-bold text-xs mb-1 mt-2 first:mt-0">{children}</h3>
  ),
  h4: ({ children }) => <h4 className="font-bold text-xs mb-1 mt-2 first:mt-0">{children}</h4>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-current/30 pl-3 my-2 italic opacity-90">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-current/20" />,
  table: ({ children }) => (
    <div className="overflow-x-auto my-2 rounded-lg border border-current/20">
      <table className="text-[11px] w-full border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-current/5">{children}</thead>,
  th: ({ children }) => (
    <th className="border border-current/20 px-2 py-1 text-left font-bold">{children}</th>
  ),
  td: ({ children }) => <td className="border border-current/20 px-2 py-1">{children}</td>,
  pre: ({ children }) => (
    <pre className="bg-slate-900 text-slate-100 rounded-lg p-3 my-2 overflow-x-auto text-[11px] font-mono">
      {children}
    </pre>
  ),
  code: ({ className, children, ...rest }) => {
    const isBlock = typeof children === 'string' && children.includes('\n');
    if (isBlock) {
      return (
        <code className={`font-mono ${className ?? ''}`} {...rest}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="font-mono bg-current/10 px-1 py-0.5 rounded text-[11px]"
        {...rest}
      >
        {children}
      </code>
    );
  },
};

export default function ChatMarkdown({ text }: ChatMarkdownProps) {
  return (
    <div className="text-xs leading-relaxed font-medium">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import "highlight.js/styles/github-dark.css";

interface MarkdownProps {
  content: string;
}

export const Markdown: React.FC<MarkdownProps> = ({ content }) => {
  const components: Components = {
    a: ({ node, ...props }) => (
      <a
        {...props}
        className="truncate text-primary hover:underline active:underline"
        target="_blank"
        rel="noopener noreferrer"
      />
    ),
    h1: ({ node, ...props }) => (
      <h1 {...props} className="scroll-m-20 text-balance font-extrabold text-2xl/snug tracking-tight" />
    ),
    h2: ({ node, ...props }) => (
      <h2 {...props} className="scroll-m-20 border-b pb-2 font-semibold text-xl/snug tracking-tight first:mt-0" />
    ),
    h3: ({ node, ...props }) => <h3 {...props} className="scroll-m-20 font-semibold text-lg/snug tracking-tight" />,
    h4: ({ node, ...props }) => <h4 {...props} className="scroll-m-20 font-semibold text-base/snug tracking-tight" />,
    p: ({ node, ...props }) => <p {...props} className="text-sm/snug [&:not(:first-child)]:mt-6" />,
    blockquote: ({ node, ...props }) => <blockquote {...props} className="mt-6 border-l-2 pl-6 italic" />,
    ul: ({ node, ...props }) => {
      if ((node?.properties?.className as string[])?.includes("contains-task-list")) {
        return <ul {...props} className="my-6 ml-6 text-sm/snug [&>li]:mt-2" />;
      }

      return <ul {...props} className="my-6 ml-6 list-disc text-sm/snug [&>li]:mt-2" />;
    },
    ol: ({ node, ...props }) => <ol {...props} className="my-6 ml-6 list-decimal text-sm/snug [&>li]:mt-2" />,
    pre: ({ node, ...props }) => <pre {...props} className="max-h-[30rem] overflow-scroll border text-sm" />,
  };

  return (
    <div className="space-y-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
        rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

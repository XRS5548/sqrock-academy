"use client";

import { useCallback, useState } from "react";
import {
  ArrowClockwiseIcon,
  TextBIcon,
  TextItalicIcon,
  LinkSimpleIcon,
  ListBulletsIcon,
  ListNumbersIcon,
  QuotesIcon,
  TextHOneIcon,
  TextHTwoIcon,
  TextUnderlineIcon,
} from "@phosphor-icons/react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "@/lib/utils";

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write a description…",
  minHeight = "11rem",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: {
          openOnClick: false,
          HTMLAttributes: { rel: "noreferrer", target: "_blank" },
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "tiptap rich-text",
        style: `min-height:${minHeight}`,
      },
    },
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }, [editor]);

  if (!editor) {
    return (
      <div className="min-h-44 animate-pulse rounded-lg border border-border bg-muted/30" />
    );
  }

  const tools = [
    {
      label: "Bold",
      icon: TextBIcon,
      active: editor.isActive("bold"),
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "Italic",
      icon: TextItalicIcon,
      active: editor.isActive("italic"),
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: "Underline",
      icon: TextUnderlineIcon,
      active: editor.isActive("underline"),
      onClick: () => editor.chain().focus().toggleUnderline().run(),
    },
    {
      label: "Heading",
      icon: TextHOneIcon,
      active: editor.isActive("heading", { level: 2 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "Subheading",
      icon: TextHTwoIcon,
      active: editor.isActive("heading", { level: 3 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: "Bullets",
      icon: ListBulletsIcon,
      active: editor.isActive("bulletList"),
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Numbered",
      icon: ListNumbersIcon,
      active: editor.isActive("orderedList"),
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "Quote",
      icon: QuotesIcon,
      active: editor.isActive("blockquote"),
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      label: "Link",
      icon: LinkSimpleIcon,
      active: editor.isActive("link"),
      onClick: setLink,
    },
    {
      label: "Undo",
      icon: ArrowClockwiseIcon,
      active: false,
      onClick: () => editor.chain().focus().undo().run(),
    },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/30 p-1.5">
        {tools.map(({ label, icon: Icon, active, onClick }) => (
          <button
            key={label}
            type="button"
            title={label}
            onClick={onClick}
            className={cn(
              "flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground",
              active && "bg-background text-foreground shadow-sm",
            )}
          >
            <Icon size={14} />
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Bold, Italic, List, ListOrdered, Image as ImageIcon } from 'lucide-react';
import { useEffect } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({ content, onChange, placeholder, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose prose-invert prose-sm max-w-none focus:outline-none min-h-[100px] w-full bg-background border-none p-3 font-mono text-sm [&_img]:inline-block [&_img]:h-4 [&_img]:w-4 [&_img]:align-middle [&_img]:mx-1 ${className || ''}`,
      },
    },
  });

  // Sync external content changes (e.g. initial load)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt('URL of the image (or mini icon):');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="flex flex-col border border-border-ink bg-surface focus-within:border-accent-vermillion transition-colors">
      <div className="flex items-center gap-1 border-b border-border-ink p-1 bg-surface">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 hover:bg-border-ink/50 transition-colors ${editor.isActive('bold') ? 'text-accent-vermillion bg-border-ink/30' : 'text-text-secondary'}`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 hover:bg-border-ink/50 transition-colors ${editor.isActive('italic') ? 'text-accent-vermillion bg-border-ink/30' : 'text-text-secondary'}`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-border-ink mx-1"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 hover:bg-border-ink/50 transition-colors ${editor.isActive('bulletList') ? 'text-accent-vermillion bg-border-ink/30' : 'text-text-secondary'}`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 hover:bg-border-ink/50 transition-colors ${editor.isActive('orderedList') ? 'text-accent-vermillion bg-border-ink/30' : 'text-text-secondary'}`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-border-ink mx-1"></div>
        <button
          type="button"
          onClick={addImage}
          className="p-1.5 text-text-secondary hover:text-accent-gold hover:bg-border-ink/50 transition-colors flex items-center gap-1 text-[10px] font-mono"
          title="Insert Image / Mini Icon"
        >
          <ImageIcon className="w-4 h-4" /> Icon
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

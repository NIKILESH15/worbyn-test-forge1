import React, { useRef, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Type your question here...",
  className = ""
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    
    const clipboardData = e.clipboardData;
    const items = clipboardData.items;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = document.createElement('img');
            img.src = event.target?.result as string;
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.margin = '10px 0';
            
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              range.deleteContents();
              range.insertNode(img);
              range.setStartAfter(img);
              range.setEndAfter(img);
              selection.removeAllRanges();
              selection.addRange(range);
            } else if (editorRef.current) {
              editorRef.current.appendChild(img);
            }
            
            handleInput();
          };
          reader.readAsDataURL(blob);
        }
        return;
      }
    }
    
    // Handle text paste
    const text = clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    handleInput();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Allow basic formatting shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          document.execCommand('bold');
          handleInput();
          break;
        case 'i':
          e.preventDefault();
          document.execCommand('italic');
          handleInput();
          break;
        case 'u':
          e.preventDefault();
          document.execCommand('underline');
          handleInput();
          break;
      }
    }
  };

  return (
    <div className={`border rounded-sm ${className}`}>
      <div className="border-b p-2 bg-muted/50">
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => { document.execCommand('bold'); handleInput(); }}
            className="px-2 py-1 text-xs border rounded hover:bg-muted"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => { document.execCommand('italic'); handleInput(); }}
            className="px-2 py-1 text-xs border rounded hover:bg-muted italic"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => { document.execCommand('underline'); handleInput(); }}
            className="px-2 py-1 text-xs border rounded hover:bg-muted underline"
          >
            U
          </button>
        </div>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        className="min-h-[120px] p-3 focus:outline-none"
        style={{
          caretColor: 'currentColor'
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />
      <style>{`
        div[contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
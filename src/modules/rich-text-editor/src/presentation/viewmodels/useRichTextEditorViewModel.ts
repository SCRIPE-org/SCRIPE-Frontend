/**
 * Rich Text Editor View Model
 * 
 * Handles all state management for the Rich Text Editor demo view.
 * Extracted from rich-text-editor-demo-view.tsx to separate business logic from UI.
 */

"use client";

import { useState, useCallback } from "react";

export function useRichTextEditorViewModel() {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = useCallback(async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Saved content:", content);
    setIsLoading(false);
  }, [content]);

  const handleLoadSample = useCallback(() => {
    const sampleContent = `
      <h2>Welcome to Rich Text Editor</h2>
      <p>This is a <strong>custom rich text editor</strong> with basic features:</p>
      
      <h3>Key Features:</h3>
      <ul>
        <li><strong>Text Formatting:</strong> Bold, italic, underline, strikethrough</li>
        <li><strong>Alignment:</strong> Left, center, right, justify</li>
        <li><strong>Lists:</strong> Bullet and numbered lists</li>
        <li><strong>Links:</strong> Insert and edit links</li>
        <li><strong>Images:</strong> Insert images from URLs</li>
        <li><strong>Code:</strong> Code blocks and inline code</li>
      </ul>
      
      <h3>Sample Content:</h3>
      <p>This editor supports basic HTML formatting and is perfect for simple content editing needs.</p>
      
      <blockquote>
        <p>This is a blockquote example for highlighting important information!</p>
      </blockquote>
      
      <p>You can also add <code>inline code</code> and create code blocks:</p>
      
      <pre><code>function hello() {
  console.log("Hello, Rich Text Editor!");
}</code></pre>
    `;
    setContent(sampleContent);
  }, []);

  return {
    content,
    isLoading,
    setContent,
    handleSave,
    handleLoadSample,
  };
}


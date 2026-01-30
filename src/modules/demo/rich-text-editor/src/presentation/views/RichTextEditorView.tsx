"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { RichTextEditor } from "@core/ui/rich-text-editor";
import { useI18n } from "@core/providers/i18n-provider";
import { useRichTextEditorViewModel } from "../viewmodels";

export function RichTextEditorDemo() {
  const { t } = useI18n();
  const { content, isLoading, setContent, handleSave, handleLoadSample } = useRichTextEditorViewModel();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rich Text Editor</CardTitle>
          <CardDescription>
            Custom rich text editor with basic formatting features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={handleLoadSample} variant="outline">
              Load Sample Content
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Content"}
            </Button>
          </div>
          
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Start typing your content here..."
            minHeight={400}
            className="border rounded-md"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Editor Features</CardTitle>
          <CardDescription>
            Basic features available in the rich text editor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">✓ Text Formatting</h4>
              <p className="text-sm text-muted-foreground">
                Bold, italic, underline, strikethrough formatting
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">✓ Alignment</h4>
              <p className="text-sm text-muted-foreground">
                Left, center, right, and justify text alignment
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">✓ Lists</h4>
              <p className="text-sm text-muted-foreground">
                Bullet lists and numbered lists support
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">✓ Links</h4>
              <p className="text-sm text-muted-foreground">
                Insert and edit hyperlinks
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">✓ Images</h4>
              <p className="text-sm text-muted-foreground">
                Insert images from URLs
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">✓ Code</h4>
              <p className="text-sm text-muted-foreground">
                Code blocks and inline code formatting
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default RichTextEditorDemo;

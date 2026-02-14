"use client";

import { useState, useCallback } from "react";
import { useDocsI18n } from "../../providers/DocsI18nProvider";

interface CodeBlockProps {
  code: string;
  language: string;
  filename?: string;
  highlightLines?: number[];
}

/**
 * Minimal syntax tokenizer — covers keywords, strings, comments, types, functions.
 * No external dependency like Prism.js needed.
 */
function tokenize(code: string, language: string): { text: string; className: string }[][] {
  const lines = code.split("\n");

  // Language-specific keyword sets
  const csharpKeywords = new Set([
    "public",
    "private",
    "protected",
    "internal",
    "static",
    "class",
    "interface",
    "record",
    "struct",
    "enum",
    "namespace",
    "using",
    "var",
    "new",
    "return",
    "if",
    "else",
    "switch",
    "case",
    "break",
    "for",
    "foreach",
    "while",
    "do",
    "try",
    "catch",
    "finally",
    "throw",
    "async",
    "await",
    "void",
    "string",
    "int",
    "bool",
    "double",
    "float",
    "decimal",
    "long",
    "byte",
    "null",
    "true",
    "false",
    "readonly",
    "const",
    "override",
    "virtual",
    "abstract",
    "sealed",
    "partial",
    "this",
    "base",
    "typeof",
    "is",
    "as",
    "in",
    "out",
    "ref",
    "where",
    "get",
    "set",
    "value",
    "yield",
    "default",
    "object",
    "Task",
    "List",
    "Dictionary",
  ]);
  const tsKeywords = new Set([
    "import",
    "export",
    "from",
    "const",
    "let",
    "var",
    "function",
    "return",
    "if",
    "else",
    "for",
    "while",
    "do",
    "switch",
    "case",
    "break",
    "continue",
    "new",
    "this",
    "class",
    "extends",
    "implements",
    "interface",
    "type",
    "enum",
    "async",
    "await",
    "try",
    "catch",
    "finally",
    "throw",
    "typeof",
    "instanceof",
    "in",
    "of",
    "null",
    "undefined",
    "true",
    "false",
    "void",
    "never",
    "any",
    "string",
    "number",
    "boolean",
    "readonly",
    "abstract",
    "static",
    "public",
    "private",
    "protected",
    "default",
    "as",
    "is",
    "keyof",
    "infer",
    "satisfies",
  ]);
  const sqlKeywords = new Set([
    "SELECT",
    "FROM",
    "WHERE",
    "INSERT",
    "INTO",
    "VALUES",
    "UPDATE",
    "SET",
    "DELETE",
    "CREATE",
    "TABLE",
    "ALTER",
    "DROP",
    "INDEX",
    "JOIN",
    "LEFT",
    "RIGHT",
    "INNER",
    "OUTER",
    "ON",
    "AND",
    "OR",
    "NOT",
    "NULL",
    "PRIMARY",
    "KEY",
    "FOREIGN",
    "REFERENCES",
    "UNIQUE",
    "DEFAULT",
    "ORDER",
    "BY",
    "GROUP",
    "HAVING",
    "LIMIT",
    "OFFSET",
    "AS",
    "DISTINCT",
    "COUNT",
    "SUM",
    "AVG",
    "MAX",
    "MIN",
    "LIKE",
    "IN",
    "BETWEEN",
    "EXISTS",
    "CASE",
    "WHEN",
    "THEN",
    "ELSE",
    "END",
    "IS",
    "INT",
    "VARCHAR",
    "TEXT",
    "BOOLEAN",
    "DATETIME",
    "NVARCHAR",
    "BIT",
    "IDENTITY",
    "CONSTRAINT",
    "CASCADE",
    "GO",
    "EXEC",
    "DECLARE",
  ]);

  const lang = language.toLowerCase();
  let keywords: Set<string>;
  let commentStart: string;
  let multiCommentStart: string;
  let multiCommentEnd: string;

  if (lang === "csharp" || lang === "cs" || lang === "c#") {
    keywords = csharpKeywords;
    commentStart = "//";
    multiCommentStart = "/*";
    multiCommentEnd = "*/";
  } else if (lang === "sql") {
    keywords = sqlKeywords;
    commentStart = "--";
    multiCommentStart = "/*";
    multiCommentEnd = "*/";
  } else {
    keywords = tsKeywords;
    commentStart = "//";
    multiCommentStart = "/*";
    multiCommentEnd = "*/";
  }

  return lines.map((line) => {
    const tokens: { text: string; className: string }[] = [];
    let i = 0;

    while (i < line.length) {
      // Comments
      if (line.slice(i).startsWith(commentStart)) {
        tokens.push({ text: line.slice(i), className: "token-comment" });
        break;
      }

      // Strings (double quote)
      if (line[i] === '"' || line[i] === "'") {
        const quote = line[i];
        let end = i + 1;
        while (end < line.length && line[end] !== quote) {
          if (line[end] === "\\") end++;
          end++;
        }
        end = Math.min(end + 1, line.length);
        tokens.push({ text: line.slice(i, end), className: "token-string" });
        i = end;
        continue;
      }

      // Template literals
      if (line[i] === "`") {
        let end = i + 1;
        while (end < line.length && line[end] !== "`") {
          if (line[end] === "\\") end++;
          end++;
        }
        end = Math.min(end + 1, line.length);
        tokens.push({ text: line.slice(i, end), className: "token-string" });
        i = end;
        continue;
      }

      // Decorators / Attributes
      if (line[i] === "@" || (line[i] === "[" && /^[A-Z]/.test(line[i + 1] || ""))) {
        let end = i + 1;
        while (end < line.length && /[\w.]/.test(line[end])) end++;
        if (line[end] === "]") end++;
        tokens.push({ text: line.slice(i, end), className: "token-decorator" });
        i = end;
        continue;
      }

      // Numbers
      if (/[0-9]/.test(line[i]) && (i === 0 || !/[\w]/.test(line[i - 1]))) {
        let end = i;
        while (end < line.length && /[0-9.]/.test(line[end])) end++;
        tokens.push({ text: line.slice(i, end), className: "token-number" });
        i = end;
        continue;
      }

      // Words
      if (/[a-zA-Z_$]/.test(line[i])) {
        let end = i;
        while (end < line.length && /[\w$]/.test(line[end])) end++;
        const word = line.slice(i, end);

        if (keywords.has(word)) {
          tokens.push({ text: word, className: "token-keyword" });
        } else if (/^[A-Z]/.test(word) && word.length > 1) {
          tokens.push({ text: word, className: "token-type" });
        } else if (line[end] === "(") {
          tokens.push({ text: word, className: "token-function" });
        } else {
          tokens.push({ text: word, className: "" });
        }
        i = end;
        continue;
      }

      // Operators
      if (/[+\-*/%=<>!&|^~?:]/.test(line[i])) {
        let end = i + 1;
        while (end < line.length && /[+\-*/%=<>!&|^~?:]/.test(line[end])) end++;
        tokens.push({ text: line.slice(i, end), className: "token-operator" });
        i = end;
        continue;
      }

      // Punctuation
      if (/[{}()[\],;.]/.test(line[i])) {
        tokens.push({ text: line[i], className: "token-punctuation" });
        i++;
        continue;
      }

      // Whitespace and other chars
      tokens.push({ text: line[i], className: "" });
      i++;
    }

    return tokens;
  });
}

export function CodeBlock({ code, language, filename, highlightLines }: CodeBlockProps) {
  const { t } = useDocsI18n();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }, [code]);

  const tokenizedLines = tokenize(code.trim(), language);
  const highlightSet = new Set(highlightLines || []);

  return (
    <div className="docs-code-block">
      <div className="docs-code-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {filename && <span className="docs-code-filename">{filename}</span>}
          <span className="docs-code-lang">{language}</span>
        </div>
        <button className="docs-code-copy" data-copied={copied} onClick={handleCopy}>
          {copied ? (
            <>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {t("common.codeCopied")}
            </>
          ) : (
            <>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
              {t("common.copyCode")}
            </>
          )}
        </button>
      </div>
      <pre className="docs-code-pre">
        <code>
          {tokenizedLines.map((lineTokens, lineIdx) => {
            const isHighlighted = highlightSet.has(lineIdx + 1);
            const lineContent = lineTokens.map((token, tokIdx) => (
              <span key={tokIdx} className={token.className || undefined}>
                {token.text}
              </span>
            ));

            return (
              <span
                key={lineIdx}
                className={isHighlighted ? "docs-code-line-highlight" : undefined}
              >
                {lineContent}
                {lineIdx < tokenizedLines.length - 1 ? "\n" : ""}
              </span>
            );
          })}
        </code>
      </pre>
    </div>
  );
}

/**
 * ValuePropsCodeSnippet — Simulated syntax-highlighted C# CQRS command handler snippet for bento card display.
 */

import React from "react";

/**
 * Syntax-tokenized lines representing a backend CQRS handler implementation.
 */
export const CODE_LINES = [
  {
    ln: "1",
    parts: [
      { type: "keyword", text: "public sealed class " },
      { type: "fn", text: "CreateTenantHandler" },
    ],
  },
  { ln: "2", parts: [{ type: "comment", text: "  // IAutoRegisteredJob + Clean Arch" }] },
  {
    ln: "3",
    parts: [
      { type: "keyword", text: "  public async " },
      { type: "type", text: "Task" },
      { type: "normal", text: "<" },
      { type: "type", text: "Result" },
      { type: "normal", text: "<" },
      { type: "type", text: "Guid" },
      { type: "normal", text: ">>" },
    ],
  },
  {
    ln: "4",
    parts: [
      { type: "fn", text: "  Handle" },
      { type: "normal", text: "(" },
      { type: "type", text: "CreateTenantCommand" },
      { type: "normal", text: " cmd)" },
    ],
  },
  { ln: "5", parts: [{ type: "keyword", text: "  {" }] },
  {
    ln: "6",
    parts: [
      { type: "keyword", text: "    var " },
      { type: "normal", text: "tenant = " },
      { type: "fn", text: "Tenant.Create" },
      { type: "normal", text: "(cmd.Name);" },
    ],
  },
  {
    ln: "7",
    parts: [
      { type: "keyword", text: "    await " },
      { type: "normal", text: "_repo." },
      { type: "fn", text: "AddAsync" },
      { type: "normal", text: "(tenant);" },
    ],
  },
  {
    ln: "8",
    parts: [
      { type: "keyword", text: "    await " },
      { type: "normal", text: "_uow." },
      { type: "fn", text: "SaveChangesAsync" },
      { type: "normal", text: "();" },
    ],
  },
  {
    ln: "9",
    parts: [
      { type: "keyword", text: "    return " },
      { type: "type", text: "Result" },
      { type: "normal", text: "<" },
      { type: "type", text: "Guid" },
      { type: "normal", text: ">.Success(tenant.Id);" },
    ],
  },
  { ln: "10", parts: [{ type: "keyword", text: "  }" }] },
];

/**
 * Renders a mock IDE code preview demonstrating backend Clean Architecture code patterns.
 *
 * @returns Stylized code editor element.
 */
export const ValuePropsCodeSnippet: React.FC = () => {
  return (
    <div className="com-bento-code" aria-hidden="true">
      {CODE_LINES.map((line) => (
        <div key={line.ln} className="com-bento-code-line">
          <span className="com-bento-code-ln">{line.ln}</span>
          <span>
            {line.parts.map((part, pi) => (
              <span key={pi} className={`com-bento-code-${part.type}`}>
                {part.text}
              </span>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
};

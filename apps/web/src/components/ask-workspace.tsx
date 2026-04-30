"use client";

import { useState } from "react";

import { askAnswers, askPrompts } from "@/lib/mock-data";

export function AskWorkspace() {
  const [activePrompt, setActivePrompt] = useState<(typeof askPrompts)[number]>(
    askPrompts[0],
  );
  const answer = askAnswers[activePrompt];

  return (
    <section className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
      <div className="surface-panel p-6">
        <div className="space-y-4">
          <p className="type-label text-muted">Required demo prompts</p>
          <div className="grid gap-3">
            {askPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setActivePrompt(prompt)}
                className={`surface-interactive px-4 py-4 text-left ${
                  activePrompt === prompt
                    ? "surface-interactive-active"
                    : "surface-interactive-muted"
                }`}
              >
                <p className="type-body-xxl-300">{prompt}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="surface-stage mt-7 space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="type-body-lg-300 text-muted">Answer</p>
            <span className="status-pill px-3 py-1">
              Confidence {answer.confidence}
            </span>
          </div>
          <h2 className="type-heading-06">{answer.answer}</h2>
          <p className="type-body-xxl-300 text-faint">{answer.missingInfo}</p>
          <div className="surface-well-soft p-4">
            <p className="type-label text-muted">Suggested skill</p>
            <p className="mt-2 type-body-xxl-400">{answer.suggestedSkill}</p>
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="surface-panel p-6">
          <p className="type-label text-muted">Citations</p>
          <div className="mt-4 space-y-3">
            {answer.citations.map((citation) => (
              <article key={citation.title} className="surface-card p-4">
                <p className="type-body-xxl-400">{citation.title}</p>
                <p className="mt-2 type-body-lg-300 text-faint">{citation.snippet}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="surface-panel p-6">
          <p className="type-label text-muted">Related graph nodes</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {answer.relatedNodes.map((node) => (
              <span key={node.id} className="status-pill px-3 py-1">
                {node.label}
              </span>
            ))}
          </div>
        </div>
      </aside>
    </section>
  );
}

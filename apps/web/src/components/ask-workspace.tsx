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
          <p className="type-label text-white/50">Required demo prompts</p>
          <div className="grid gap-3">
            {askPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setActivePrompt(prompt)}
                className={`rounded-[28px] border px-4 py-4 text-left transition ${
                  activePrompt === prompt
                    ? "border-white/18 bg-white/8 text-white"
                    : "border-white/10 bg-white/4 text-white/70 hover:bg-white/6 hover:text-white"
                }`}
              >
                <p className="type-body-xxl-300">{prompt}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-7 space-y-4 rounded-[28px] border border-white/10 bg-black/40 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="type-body-lg-300 text-white/50">Answer</p>
            <span className="surface-chip px-3 py-1 text-white/70">
              Confidence {answer.confidence}
            </span>
          </div>
          <h2 className="type-heading-06 text-white">{answer.answer}</h2>
          <p className="type-body-xxl-300 text-white/60">{answer.missingInfo}</p>
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
            <p className="type-label text-white/50">Suggested skill</p>
            <p className="mt-2 type-body-xxl-400 text-white">{answer.suggestedSkill}</p>
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="surface-panel p-6">
          <p className="type-label text-white/50">Citations</p>
          <div className="mt-4 space-y-3">
            {answer.citations.map((citation) => (
              <article key={citation.title} className="surface-card p-4">
                <p className="type-body-xxl-400 text-white">{citation.title}</p>
                <p className="mt-2 type-body-lg-300 text-white/60">{citation.snippet}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="surface-panel p-6">
          <p className="type-label text-white/50">Related graph nodes</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {answer.relatedNodes.map((node) => (
              <span key={node.id} className="surface-chip px-3 py-1 text-white/70">
                {node.label}
              </span>
            ))}
          </div>
        </div>
      </aside>
    </section>
  );
}

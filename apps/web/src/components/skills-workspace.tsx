"use client";

import { useState } from "react";

import { skills } from "@/lib/mock-data";

export function SkillsWorkspace() {
  const [selectedSkillId, setSelectedSkillId] = useState(skills[0].id);
  const selectedSkill = skills.find((skill) => skill.id === selectedSkillId) ?? skills[0];

  return (
    <section className="grid gap-4 xl:grid-cols-[0.94fr_1.06fr]">
      <div className="space-y-4">
        {skills.map((skill) => (
          <button
            key={skill.id}
            type="button"
            onClick={() => setSelectedSkillId(skill.id)}
            className={`surface-card flex w-full flex-col items-start gap-4 p-5 text-left ${
              skill.id === selectedSkillId ? "status-pill-strong" : ""
            }`}
          >
            <div className="flex w-full flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <h2 className="type-heading-06">{skill.name}</h2>
                <p className="type-body-lg-300 text-muted">{skill.trigger}</p>
              </div>
              <span className="status-pill px-3 py-1">{skill.status}</span>
            </div>
            <div className="grid w-full gap-3 sm:grid-cols-3">
              <div>
                <p className="type-label text-muted">Confidence</p>
                <p className="mt-1 type-body-xxl-400">{skill.confidence}</p>
              </div>
              <div>
                <p className="type-label text-muted">Approval</p>
                <p className="mt-1 type-body-xxl-400">{skill.approval}</p>
              </div>
              <div>
                <p className="type-label text-muted">Sources</p>
                <p className="mt-1 type-body-xxl-400">{skill.sources}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <aside className="surface-panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="type-label text-muted">Draft skill detail</p>
            <h2 className="type-heading-04">{selectedSkill.name}</h2>
            <p className="type-body-lg-300 text-muted">
              Version {selectedSkill.version} | {selectedSkill.status} | {selectedSkill.confidence}
            </p>
          </div>
          <div className="flex gap-2">
            <span className="status-pill px-3 py-1">Export JSON</span>
            <span className="status-pill px-3 py-1">Approve</span>
          </div>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-2">
          <div>
            <p className="type-label text-muted">Trigger</p>
            <p className="mt-2 type-body-xxl-300 text-soft">{selectedSkill.trigger}</p>
          </div>
          <div>
            <p className="type-label text-muted">Inputs required</p>
            <ul className="mt-2 space-y-1">
              {selectedSkill.inputsRequired.map((item) => (
                <li key={item} className="type-body-lg-300 text-soft">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="type-label text-muted">Steps</p>
            <ol className="mt-2 space-y-2">
              {selectedSkill.steps.map((item, index) => (
                <li key={item} className="type-body-lg-300 text-soft">
                  {index + 1}. {item}
                </li>
              ))}
            </ol>
          </div>
          <div>
            <p className="type-label text-muted">Approval gates</p>
            <ul className="mt-2 space-y-2">
              {selectedSkill.approvalGates.map((gate) => (
                <li key={gate.gate} className="type-body-lg-300 text-soft">
                  {gate.gate}: {gate.requiredWhen}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="type-label text-muted">Allowed actions</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedSkill.allowedActions.map((item) => (
                <span key={item} className="status-pill px-3 py-1">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="type-label text-muted">Forbidden actions</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedSkill.forbiddenActions.map((item) => (
                <span key={item} className="status-pill px-3 py-1">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2">
            <p className="type-label text-muted">Source citations</p>
            <ul className="mt-2 space-y-2">
              {selectedSkill.sourceCitations.map((item) => (
                <li key={item} className="type-body-lg-300 text-soft">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </section>
  );
}

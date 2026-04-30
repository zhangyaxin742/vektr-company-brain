import type { ReactNode } from "react";

type AppPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function AppPage({
  eyebrow,
  title,
  description,
  actions,
  children,
}: AppPageProps) {
  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
      <header className="surface-panel flex flex-col gap-5 px-6 py-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="type-label text-white/50">{eyebrow}</p>
          <h1 className="type-heading-04 max-w-4xl text-balance text-white">{title}</h1>
          <p className="type-body-xxl-300 max-w-3xl text-white/50">{description}</p>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </header>
      {children}
    </div>
  );
}

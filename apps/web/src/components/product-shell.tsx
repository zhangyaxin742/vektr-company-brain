import type { ReactNode } from "react";
import Link from "next/link";

import { ProductNav } from "@/components/product-nav";
import { ArrowButton, BasicButton } from "@/components/ui/vektr-button";

export function ProductShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="header-shell sticky top-0 z-30">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4 px-5 py-4 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <span className="brand-mark size-10 text-sm font-medium">
                V
              </span>
              <div>
                <p className="type-body-lg-400">Vektr</p>
                <p className="type-label text-muted">Your company brain, mapped.</p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <BasicButton href="/demo" className="hidden sm:inline-flex">
                Try Acme Labs Demo
              </BasicButton>
              <ArrowButton href="/health" ariaLabel="Open health page" />
            </div>
          </div>
          <ProductNav />
        </div>
      </header>
      {children}
    </div>
  );
}

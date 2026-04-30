import type { ReactNode } from "react";
import Link from "next/link";

import { ProductNav } from "@/components/product-nav";
import { ArrowButton, BasicButton } from "@/components/ui/vektr-button";

export function ProductShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/8 bg-[#0d0d0d]/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4 px-5 py-4 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/6 text-sm font-medium text-white">
                V
              </span>
              <div>
                <p className="type-body-lg-400 text-white">Vektr</p>
                <p className="type-label text-white/50">Your company brain, mapped.</p>
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

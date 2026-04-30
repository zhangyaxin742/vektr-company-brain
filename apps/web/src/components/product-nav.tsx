"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { productNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function ProductNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-2 overflow-x-auto pb-1">
      {productNavigation.map((item) => {
        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 transition",
              active
                ? "border border-white/12 bg-white/8 text-white"
                : "text-white/55 hover:bg-white/5 hover:text-white",
            )}
          >
            <span className="type-body-lg-300">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

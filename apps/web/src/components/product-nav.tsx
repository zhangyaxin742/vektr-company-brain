"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { productNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function ProductNav() {
  const pathname = usePathname();
  const scopedMatch = pathname.match(/^\/org\/([^/]+)\//);
  const scopedPrefix = scopedMatch ? `/org/${scopedMatch[1]}` : null;

  return (
    <nav className="flex items-center gap-2 overflow-x-auto pb-1">
      {productNavigation.map((item) => {
        const href =
          item.scope === "org" && scopedPrefix ? `${scopedPrefix}${item.href}` : item.href;
        const active = pathname === href;

        return (
          <Link
            key={href}
            href={href}
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

"use client";

import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";

type VektrButtonProps = {
  href?: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  target?: string;
  rel?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
};

type ButtonElementProps = Pick<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "disabled"
>;

function classNames(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(" ");
}

function isExternalHref(href: string) {
  return /^(?:[a-z][a-z\d+.-]*:)?\/\//i.test(href) || href.startsWith("mailto:");
}

function ButtonShell({
  href,
  children,
  className,
  ariaLabel,
  target,
  rel,
  onClick,
  variant,
  buttonProps,
}: VektrButtonProps & {
  variant: "basic" | "rainbow";
  buttonProps?: ButtonElementProps;
}) {
  const content = (
    <>
      <span className="vektr-button__surface">
        <span className="vektr-button__content">
          <span className="vektr-button__text" data-label={children}>
            <span className="vektr-button__text-line">{children}</span>
            <span className="vektr-button__text-line" aria-hidden="true">
              {children}
            </span>
          </span>
          <span className="vektr-button__icon" aria-hidden="true">
            <span className="vektr-button__icon-line">
              <ChevronRight size={14} strokeWidth={2.5} />
            </span>
            <span className="vektr-button__icon-line">
              <ChevronRight size={14} strokeWidth={2.5} />
            </span>
          </span>
        </span>
      </span>
      {variant === "rainbow" ? <span className="vektr-button__stroke" /> : null}
    </>
  );
  const computedClassName = classNames(
    "vektr-button",
    variant === "rainbow" ? "vektr-button--rainbow" : "vektr-button--basic",
    className,
  );

  if (href) {
    const safeRel = target === "_blank" ? (rel ?? "noreferrer") : rel;

    if (!isExternalHref(href) && href.startsWith("/")) {
      return (
        <Link
          href={href}
          className={computedClassName}
          aria-label={ariaLabel}
          target={target}
          rel={safeRel}
          onClick={onClick as MouseEventHandler<HTMLAnchorElement>}
        >
          {content}
        </Link>
      );
    }

    return (
      <a
        href={href}
        className={computedClassName}
        aria-label={ariaLabel}
        target={target}
        rel={safeRel}
        onClick={onClick as MouseEventHandler<HTMLAnchorElement>}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={buttonProps?.type ?? "button"}
      disabled={buttonProps?.disabled}
      className={computedClassName}
      aria-label={ariaLabel}
      onClick={onClick as MouseEventHandler<HTMLButtonElement>}
    >
      {content}
    </button>
  );
}

export function BasicButton(props: VektrButtonProps & ButtonElementProps) {
  const { type, disabled, ...rest } = props;

  return (
    <ButtonShell
      {...rest}
      variant="basic"
      buttonProps={{ type, disabled }}
    />
  );
}

export function RainbowButton(props: VektrButtonProps & ButtonElementProps) {
  const { type, disabled, ...rest } = props;

  return (
    <ButtonShell
      {...rest}
      variant="rainbow"
      buttonProps={{ type, disabled }}
    />
  );
}

export function ArrowButton({
  href,
  className,
  ariaLabel,
  target,
  rel,
  onClick,
  type,
  disabled,
}: Omit<VektrButtonProps, "children"> & ButtonElementProps) {
  if (!ariaLabel) {
    throw new Error("ArrowButton requires ariaLabel.");
  }

  const content = (
    <>
      <span className="vektr-arrow-button__icon" aria-hidden="true">
        <ArrowUpRight size={21} strokeWidth={2.2} />
      </span>
      <span
        className="vektr-arrow-button__icon vektr-arrow-button__icon--hover"
        aria-hidden="true"
      >
        <ArrowUpRight size={21} strokeWidth={2.2} />
      </span>
    </>
  );
  const computedClassName = classNames("vektr-arrow-button", className);

  if (href) {
    const safeRel = target === "_blank" ? (rel ?? "noreferrer") : rel;

    if (!isExternalHref(href) && href.startsWith("/")) {
      return (
        <Link
          href={href}
          className={computedClassName}
          aria-label={ariaLabel}
          target={target}
          rel={safeRel}
          onClick={onClick as MouseEventHandler<HTMLAnchorElement>}
        >
          {content}
        </Link>
      );
    }

    return (
      <a
        href={href}
        className={computedClassName}
        aria-label={ariaLabel}
        target={target}
        rel={safeRel}
        onClick={onClick as MouseEventHandler<HTMLAnchorElement>}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type ?? "button"}
      disabled={disabled}
      className={computedClassName}
      aria-label={ariaLabel}
      onClick={onClick as MouseEventHandler<HTMLButtonElement>}
    >
      {content}
    </button>
  );
}

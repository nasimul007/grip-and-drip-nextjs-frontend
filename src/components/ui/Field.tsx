"use client";
import React from "react";
import { useT } from "@/lib/i18n/client";

export const fieldClass = (error?: boolean) =>
  `w-full rounded-md border bg-brand-surface px-3.5 py-2.5 text-white placeholder:text-brand-muted outline-none duration-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 disabled:opacity-60 ${
    error ? "border-red" : "border-brand-border"
  }`;

type Common = { id: string; label: string; error?: string; hint?: string; required?: boolean; wrapperClassName?: string };

function Wrap({ id, label, error, hint, required, wrapperClassName = "", children }: Common & { children: React.ReactNode }) {
  const { t } = useT();
  return (
    <div className={wrapperClassName}>
      <label htmlFor={id} className="mb-1.5 block text-custom-sm text-white">
        {label}
        {required ? <span className="text-red" aria-hidden="true"> *</span> : null}
        {required ? <span className="sr-only"> ({t("required")})</span> : null}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-custom-xs text-brand-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-custom-xs text-red">
          {error}
        </p>
      )}
    </div>
  );
}

const describe = (id: string, error?: string, hint?: string) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined);

export function TextField({
  id, label, error, hint, required, wrapperClassName, className = "", ...props
}: Common & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Wrap id={id} label={label} error={error} hint={hint} required={required} wrapperClassName={wrapperClassName}>
      <input
        id={id}
        name={props.name || id}
        required={false}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describe(id, error, hint)}
        className={`${fieldClass(!!error)} ${className}`}
        {...props}
      />
    </Wrap>
  );
}

export function TextAreaField({
  id, label, error, hint, required, wrapperClassName, className = "", ...props
}: Common & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Wrap id={id} label={label} error={error} hint={hint} required={required} wrapperClassName={wrapperClassName}>
      <textarea
        id={id}
        name={props.name || id}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describe(id, error, hint)}
        className={`${fieldClass(!!error)} ${className}`}
        {...props}
      />
    </Wrap>
  );
}

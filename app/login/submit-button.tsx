"use client";
import { type ComponentProps } from "react";

type Props = ComponentProps<"button"> & {
  pendingText?: string;
};

export function SubmitButton({ children, pendingText, ...props }: Props) {

  return (
    <button {...props} type="submit">
      {children}
    </button>
  );
}

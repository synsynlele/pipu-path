"use client";
import { useActionState } from "react";
import { signOutAction } from "@/modules/identity/application/auth-actions";
import { Button } from "@/components/ui/button";
export function SignOutForm({ mobile = false }: { mobile?: boolean }) {
  const [state, action, pending] = useActionState(signOutAction, {
    message: "",
  });
  return (
    <form action={action} aria-busy={pending}>
      <Button
        type="submit"
        variant="ghost"
        disabled={pending}
        className={
          mobile
            ? "min-h-11 rounded-full border border-white/20 bg-white/8 px-3 text-xs text-white"
            : "min-h-11 px-3.5"
        }
      >
        {pending ? "Signing out…" : "Sign out"}
      </Button>
      {state.message ? (
        <p
          role="alert"
          className="absolute top-full right-4 mt-2 max-w-xs rounded-xl border border-[#e3e5ef] bg-white p-3 text-sm text-[#b42343] shadow-lg"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

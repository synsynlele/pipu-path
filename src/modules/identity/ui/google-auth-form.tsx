import { Button } from "@/components/ui/button";
import { signInWithGoogleAction } from "@/modules/identity/application/auth-actions";

export function GoogleAuthForm({ next = "/app" }: { next?: string }) {
  const action = signInWithGoogleAction.bind(null, next);

  return (
    <form action={action}>
      <Button type="submit" variant="secondary" className="w-full">
        Continue with Google
      </Button>
    </form>
  );
}

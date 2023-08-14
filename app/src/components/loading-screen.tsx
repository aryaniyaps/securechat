import { Icons } from "./icons";

export default function LoadingScreen() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center">
      <Icons.spinner className="h-8 w-8 animate-spin text-secondary" />
    </main>
  );
}

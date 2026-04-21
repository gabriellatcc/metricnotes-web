import { createFileRoute, redirect } from "@tanstack/react-router";

import { NotesPage } from "@/components/notes/notes-page";
import { getAuthAccessToken } from "@/lib/api-client";

export const Route = createFileRoute("/notes")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!getAuthAccessToken()) {
      throw redirect({ to: "/login" });
    }
  },
  component: NotesRoute,
});

function NotesRoute() {
  return <NotesPage />;
}

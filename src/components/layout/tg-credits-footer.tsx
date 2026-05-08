import { ExternalLink, Mail } from "lucide-react";

import { cn } from "@/lib/utils";

type TgCreditsFooterProps = {
  className?: string;
};

const GITHUB_HREF = "https://github.com/gabriellatcc";
const LINKEDIN_HREF = "https://www.linkedin.com/in/gabriellacorrea";
const EMAIL = "gabriellatccorrea@gmail.com";

export function TgCreditsFooter({ className }: TgCreditsFooterProps) {
  const linkClass =
    "inline-flex items-center gap-0.5 underline decoration-border underline-offset-2 hover:text-foreground";

  return (
    <footer
      role="contentinfo"
      className={cn(
        "border-t border-border/50 bg-muted/15 px-3 py-3 text-muted-foreground",
        className,
      )}
    >
      <div className="mx-auto grid max-w-5xl gap-3 text-[10px] leading-snug sm:grid-cols-3 sm:gap-6 sm:text-[11px]">
        <section className="text-center sm:text-left">
          <h2 className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-foreground/80">Contato</h2>
          <ul className="space-y-0.5">
            <li>
              <a href={GITHUB_HREF} target="_blank" rel="noopener noreferrer" className={linkClass}>
                GitHub · gabriellatcc
                <ExternalLink className="size-2.5 shrink-0 opacity-60" aria-hidden />
              </a>
            </li>
            <li>
              <a href={LINKEDIN_HREF} target="_blank" rel="noopener noreferrer" className={linkClass}>
                LinkedIn · gabriellacorrea
                <ExternalLink className="size-2.5 shrink-0 opacity-60" aria-hidden />
              </a>
            </li>
            <li>
              <a href={`mailto:${EMAIL}`} className={linkClass}>
                <Mail className="size-2.5 shrink-0 opacity-60" aria-hidden />
                {EMAIL}
              </a>
            </li>
          </ul>
        </section>

        <section className="text-center sm:text-left">
          <h2 className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-foreground/80">
            Responsável pelo desenvolvimento
          </h2>
          <p>Gabriella Tavares Costa Correa</p>
          <p className="mt-1 text-muted-foreground/95">
            TG · FATEC Cruzeiro Prof. Waldomiro Way · versão 1.0
          </p>
        </section>

        <section className="text-center sm:text-left">
          <h2 className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-foreground/80">Orientadora</h2>
          <p>Ana Carolina Satim Rodrigues</p>
        </section>
      </div>
    </footer>
  );
}

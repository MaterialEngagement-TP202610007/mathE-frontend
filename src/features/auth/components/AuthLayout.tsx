import type { ReactNode } from "react";
import { GraduationCap } from "lucide-react";
import { MatheLogo } from "@/shared/components/icons/MatheLogo";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="grid min-h-svh laptop:grid-cols-[1fr_1fr]">
      <aside
        className="relative hidden flex-col justify-between p-12 text-mathe-white laptop:flex"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.65) 100%), url(/images/auth-background.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <MatheLogo />
        <div className="max-w-md">
          <h2 className="text-4xl font-bold leading-tight">
            Descubre tu estilo de aprendizaje
          </h2>
          <p className="mt-4 text-base/relaxed text-mathe-white/80">
            Diagnóstico VAK (Visual · Auditivo · Kinestésico) con respaldo
            institucional y retroalimentación pedagógica personalizada.
          </p>
        </div>
        <p className="text-sm text-mathe-white/60">Proyecto de tesis UPC</p>
      </aside>

      <main className="flex flex-col items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 text-mathe-blue laptop:hidden">
            <GraduationCap className="size-6" />
            <span className="text-lg font-semibold">Math.E</span>
          </div>

          <header className="mb-8">
            <h1 className="text-3xl font-bold text-mathe-ink">{title}</h1>
            {subtitle && <p className="mt-2 text-mathe-muted">{subtitle}</p>}
          </header>

          {children}

          {footer && (
            <div className="mt-6 text-center text-sm text-mathe-muted">
              {footer}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

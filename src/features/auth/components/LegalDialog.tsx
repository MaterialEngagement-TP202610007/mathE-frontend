import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { LegalDoc } from "../data/legal-content"

interface LegalDialogProps {
  trigger: string
  doc: LegalDoc
}

/** Inline link that opens a modal with a legal document (terms / privacy). */
export function LegalDialog({ trigger, doc }: LegalDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="font-semibold text-mathe-blue underline"
        >
          {trigger}
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-mathe-blue text-2xl font-semibold">{doc.title}</DialogTitle>
          {doc.intro && <DialogDescription>{doc.intro}</DialogDescription>}
        </DialogHeader>
        <div className="grid max-h-[55vh] gap-4 overflow-y-auto pr-1 text-sm text-mathe-muted">
          {doc.sections.map((section, i) => (
            <div key={section.heading} className="grid gap-1">
              <DialogTitle asChild>
                <h3 className="font-semibold text-mathe-ink">
                  {i + 1}. {section.heading}
                </h3>
              </DialogTitle>
              <p className="leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button className="h-11 rounded-pill bg-mathe-blue px-6 font-semibold hover:bg-mathe-blue-deep">
              Entendido
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

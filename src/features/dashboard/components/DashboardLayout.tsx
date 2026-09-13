import { useState } from "react"
import { Outlet } from "react-router"
import { TermsModal } from "@/features/quiz/components/TermsModal"
import { BrainLoader } from "@/features/questions/components/BrainLoader"
import { MobileSidebar, Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"

export function DashboardLayout() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex min-h-svh bg-mathe-surface">
      <Sidebar />
      <MobileSidebar open={menuOpen} onOpenChange={setMenuOpen} />
      <div className="flex min-h-svh min-w-0 flex-1 flex-col">
        <Topbar onOpenMenu={() => setMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 py-6 tablet:px-6 tablet:py-8 laptop:px-10">
          <Outlet />
        </main>
      </div>
      <TermsModal />
      <BrainLoader />
    </div>
  )
}

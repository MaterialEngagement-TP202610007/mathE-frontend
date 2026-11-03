import { useState } from "react"
import { motion } from "motion/react"
import { Outlet, useLocation } from "react-router"
import { useIdleLogout } from "@/features/auth/hooks/useIdleLogout"
import { TermsModal } from "@/features/quiz/components/TermsModal"
import { BrainLoader } from "@/features/questions/components/BrainLoader"
import { MobileSidebar, Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"

export function DashboardLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  useIdleLogout()

  return (
    <div className="flex min-h-svh bg-mathe-surface">
      <Sidebar />
      <MobileSidebar open={menuOpen} onOpenChange={setMenuOpen} />
      <div className="flex min-h-svh min-w-0 flex-1 flex-col">
        <Topbar onOpenMenu={() => setMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 py-6 tablet:px-6 tablet:py-8 laptop:px-10">
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
      <TermsModal />
      <BrainLoader />
    </div>
  )
}

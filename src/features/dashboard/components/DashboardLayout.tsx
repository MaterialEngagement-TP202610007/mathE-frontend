import { Outlet } from "react-router"
import { TermsModal } from "@/features/quiz/components/TermsModal"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"

/**
 * Shell for all authenticated routes: fixed sidebar + topbar, with the routed
 * page rendered in the center via <Outlet> (re-renders on every route change).
 */
export function DashboardLayout() {
  return (
    <div className="flex min-h-svh bg-mathe-surface">
      <Sidebar />
      <div className="flex min-h-svh flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-6 py-8 laptop:px-10">
          <Outlet />
        </main>
      </div>
      <TermsModal />
    </div>
  )
}

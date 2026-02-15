"use client"
import React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, BarChart3, PieChart, FileText, BarChart2, Settings, GitCompare, LogOut } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard général", href: "/dashboard" },
    { icon: BarChart3, label: "Analyse des cabinets", href: "/analyses" },
    { icon: GitCompare, label: "Comparaison Cabinets", href: "/analyses/absences" },
    { icon: PieChart, label: "Gestion cabinets", href: "/cabinets" },
    { icon: FileText, label: "Rapports cabinet", href: "/rapports" },
    { icon: BarChart2, label: "Statistiques des cabinets", href: "/consultations" },
    { icon: Settings, label: "RÉGLAGES", href: "/settings" },
  ]

  const handleLogout = () => {
    // Supprimer le cookie auth_token
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    // Supprimer les données localStorage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    // Rediriger vers la page de login
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-[#1a3a6e] to-[#0d2444] border-r border-white/10 flex flex-col z-50">
      {/* Logo EFFICIENCE */}
      <div className="p-6 mb-4">
        <div className="flex flex-col items-center">
          {/* EFFICIENCE avec barres stylisées */}
          <div className="flex items-center text-white font-bold text-[22px] tracking-wide">
            {/* E stylisé avec barres */}
            <span className="flex flex-col mr-[1px]">
              <span className="w-[14px] h-[2.5px] bg-white mb-[3px]"></span>
              <span className="w-[14px] h-[2.5px] bg-white mb-[3px]"></span>
              <span className="w-[14px] h-[2.5px] bg-white"></span>
            </span>
            <span>FFICI</span>
            {/* E stylisé avec barres */}
            <span className="flex flex-col mx-[1px]">
              <span className="w-[14px] h-[2.5px] bg-white mb-[3px]"></span>
              <span className="w-[14px] h-[2.5px] bg-white mb-[3px]"></span>
              <span className="w-[14px] h-[2.5px] bg-white"></span>
            </span>
            <span>NC</span>
            {/* E stylisé avec barres */}
            <span className="flex flex-col ml-[1px]">
              <span className="w-[14px] h-[2.5px] bg-white mb-[3px]"></span>
              <span className="w-[14px] h-[2.5px] bg-white mb-[3px]"></span>
              <span className="w-[14px] h-[2.5px] bg-white"></span>
            </span>
          </div>
          {/* Cabinet Source */}
          <div className="flex items-center gap-1.5 mt-4">
            <span className="text-[10px] text-white/60 font-medium uppercase tracking-widest">Cabinet Source</span>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href} className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${pathname === item.href ? "bg-white/20 text-white shadow-lg" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
            <item.icon className="w-5 h-5" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">{item.label}</span>
          </Link>
        ))}
      </nav>
      {/* Bouton Déconnexion */}
      <div className="px-4 pb-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 w-full px-6 py-4 rounded-2xl transition-all text-red-300 hover:bg-red-500/20 hover:text-red-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">Déconnexion</span>
        </button>
      </div>
    </aside>
  )
}
export default Sidebar;
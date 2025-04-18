"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  GamepadIcon,
  FileText,
  Settings,
  Menu,
  Users,
  FileCheck,
  FileWarning,
  BookOpen,
  BarChart3,
  PieChart,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { Tooltip } from "./ui/tooltip"

interface MenuItem {
  title: string
  icon: JSX.Element
  href?: string
  badge?: string
  active?: boolean
  submenu?: MenuItem[]
  description?: string
}

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({})
  const isMobile = useMobile()

  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen)
  }

  const toggleSubmenu = (title: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  const menuItems: MenuItem[] = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      href: "/",
      badge: "Em breve",
      description: "Estatísticas e métricas de avaliações",
      submenu: [
        {
          title: "Visão Geral",
          icon: <PieChart size={18} />,
          href: "/",
          description: "Resumo de avaliações e status",
        },
        {
          title: "Análises",
          icon: <BarChart3 size={18} />,
          href: "#",
          description: "Relatórios detalhados",
        },
      ],
    },
    {
      title: "Game LGPD",
      icon: <GamepadIcon size={20} />,
      href: "/lgpd-game",
      description: "Treinamento interativo sobre LGPD",
    },
    {
      title: "Avaliação",
      icon: <FileText size={20} />,
      active: true,
      description: "Avaliações de risco de fornecedores",
      submenu: [
        {
          title: "Nova Avaliação",
          icon: <FileText size={18} />,
          href: "/supplier-risk-assessment",
          active: true,
          description: "Iniciar nova avaliação de risco",
        },
        {
          title: "Fornecedores",
          icon: <Users size={18} />,
          href: "/suppliers",
          description: "Lista de fornecedores",
        },
        {
          title: "Aprovados",
          icon: <FileCheck size={18} />,
          href: "#",
          description: "Fornecedores aprovados",
        },
        {
          title: "Pendentes",
          icon: <FileWarning size={18} />,
          href: "#",
          description: "Fornecedores pendentes",
        },
      ],
    },
    {
      title: "Documentação",
      icon: <BookOpen size={20} />,
      href: "#",
      description: "Guias e políticas sobre LGPD",
      submenu: [
        {
          title: "Guias",
          icon: <FileText size={18} />,
          href: "#",
          description: "Guias sobre avaliação e LGPD",
        },
        {
          title: "Políticas",
          icon: <FileText size={18} />,
          href: "#",
          description: "Políticas de proteção de dados",
        },
      ],
    },
    {
      title: "Configurações",
      icon: <Settings size={20} />,
      href: "#",
      badge: "Em breve",
      description: "Preferências do sistema",
    },
  ]

  const renderMenuItem = (item: MenuItem, index: number, isSubmenuItem = false) => {
    // Se o item tem submenu, renderiza como um item expansível
    if (item.submenu && item.submenu.length > 0) {
      const isExpanded = expandedMenus[item.title] || false

      return (
        <li key={`${item.title}-${index}`}>
          <Tooltip
            content={
              <div>
                <p className="font-medium">{item.title}</p>
                {item.description && <p className="text-xs mt-1 text-white/80">{item.description}</p>}
              </div>
            }
            position="right"
            disabled={!collapsed || isMobile}
          >
            <button
              onClick={() => toggleSubmenu(item.title)}
              className={cn(
                "w-full flex items-center px-3 py-2 rounded-md transition-colors relative",
                item.active ? "bg-navy/20 text-white" : "text-white/80 hover:bg-navy/40 hover:text-white",
                isSubmenuItem && "pl-6 text-sm",
              )}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {(!collapsed || isMobile) && (
                <>
                  <span className="ml-3 flex-1 text-left truncate pr-2">{item.title}</span>
                  <ChevronDown
                    size={16}
                    className={cn(
                      "transition-transform duration-200 flex-shrink-0",
                      isExpanded ? "transform rotate-180" : "",
                    )}
                  />
                  {item.badge && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-navy/30 text-white/90 flex-shrink-0">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {collapsed && !isMobile && item.badge && (
                <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-white"></span>
              )}
            </button>
          </Tooltip>

          <AnimatePresence initial={false}>
            {isExpanded && (!collapsed || isMobile) && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden ml-2 border-l border-navy/30"
              >
                {item.submenu.map((subItem, subIndex) => renderMenuItem(subItem, subIndex, true))}
              </motion.ul>
            )}
          </AnimatePresence>

          {/* Tooltip for collapsed state */}
          {collapsed && !isMobile && item.submenu && (
            <div className="group relative">
              <div className="hidden group-hover:block absolute left-full top-0 ml-2 bg-navy p-2 rounded-md shadow-md z-50 w-48">
                <ul className="space-y-1">
                  {item.submenu.map((subItem, subIndex) => (
                    <li key={`tooltip-${index}-${subIndex}`}>
                      <Tooltip
                        content={
                          <div>
                            <p className="font-medium">{subItem.title}</p>
                            {subItem.description && <p className="text-xs mt-1 text-white/80">{subItem.description}</p>}
                          </div>
                        }
                        position="right"
                      >
                        <Link
                          href={subItem.href || "#"}
                          className={cn(
                            "flex items-center px-3 py-2 rounded-md transition-colors",
                            subItem.active
                              ? "bg-navy/30 text-white"
                              : "text-white/80 hover:bg-navy/40 hover:text-white",
                          )}
                        >
                          <span className="flex-shrink-0">{subItem.icon}</span>
                          <span className="ml-3 flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
                            {subItem.title}
                          </span>
                        </Link>
                      </Tooltip>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </li>
      )
    }

    // Se o item não tem submenu, renderiza como um link normal
    return (
      <li key={`${item.title}-${index}`}>
        <Tooltip
          content={
            <div>
              <p className="font-medium">{item.title}</p>
              {item.description && <p className="text-xs mt-1 text-white/80">{item.description}</p>}
            </div>
          }
          position="right"
          disabled={!collapsed || isMobile}
        >
          <Link
            href={item.href || "#"}
            className={cn(
              "flex items-center px-3 py-2 rounded-md transition-colors relative",
              item.active ? "bg-navy/20 text-white" : "text-white/80 hover:bg-navy/40 hover:text-white",
              isSubmenuItem && "pl-6 text-sm",
            )}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {(!collapsed || isMobile) && (
              <>
                <span className="ml-3 flex-1 whitespace-nowrap overflow-hidden text-ellipsis pr-2">{item.title}</span>
                {item.badge && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-navy/30 text-white/90 flex-shrink-0">
                    {item.badge}
                  </span>
                )}
              </>
            )}
            {collapsed && !isMobile && item.badge && (
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-white"></span>
            )}
          </Link>
        </Tooltip>
      </li>
    )
  }

  // Sidebar para desktop
  const desktopSidebar = (
    <motion.div
      className={cn(
        "hidden md:flex flex-col h-screen fixed top-0 left-0 bg-navy border-r border-navy/20 shadow-sm z-30 transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className,
      )}
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between p-4 border-b border-navy/20">
        {!collapsed && (
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo-rafael-maciel.png"
              alt="Rafael Maciel Sociedade de Advogados"
              width={150}
              height={40}
              className="h-10 w-auto brightness-0 invert"
            />
          </Link>
        )}
        <Tooltip content={collapsed ? "Expandir menu" : "Recolher menu"} position="right">
          <button
            onClick={toggleSidebar}
            className={cn(
              "p-2 rounded-full hover:bg-navy/40 transition-colors text-white",
              collapsed ? "mx-auto" : "ml-auto",
            )}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </Tooltip>
      </div>

      <div className="flex flex-col flex-1 py-4 overflow-y-auto">
        <nav className="flex-1">
          <ul className="space-y-1 px-2">{menuItems.map((item, index) => renderMenuItem(item, index))}</ul>
        </nav>
      </div>

      {/* Removed user profile section */}
    </motion.div>
  )

  // Sidebar para mobile
  const mobileSidebar = (
    <>
      <Tooltip content="Abrir menu" position="right">
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-md bg-navy text-white shadow-md"
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>
      </Tooltip>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleMobileSidebar} />
      )}

      <motion.div
        className="md:hidden fixed top-0 left-0 h-screen w-64 bg-navy shadow-lg z-50 overflow-y-auto"
        initial={{ x: "-100%" }}
        animate={{ x: mobileOpen ? 0 : "-100%" }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between p-4 border-b border-navy/20">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo-rafael-maciel.png"
              alt="Rafael Maciel Sociedade de Advogados"
              width={150}
              height={40}
              className="h-10 w-auto brightness-0 invert"
            />
          </Link>
          <Tooltip content="Fechar menu" position="left">
            <button
              onClick={toggleMobileSidebar}
              className="p-2 rounded-full hover:bg-navy/40 text-white"
              aria-label="Fechar menu"
            >
              <ChevronLeft size={20} />
            </button>
          </Tooltip>
        </div>

        <div className="flex flex-col flex-1 py-4">
          <nav className="flex-1">
            <ul className="space-y-1 px-2">{menuItems.map((item, index) => renderMenuItem(item, index))}</ul>
          </nav>
        </div>

        {/* Removed user profile section */}
      </motion.div>
    </>
  )

  return (
    <>
      {desktopSidebar}
      {mobileSidebar}
    </>
  )
}

import { ReactNode } from "react"
import Link from "next/link"
import { Home, ClipboardList, Users, BarChart3, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OfficeLayoutProps {
  children: ReactNode
}

export default function OfficeLayout({ children }: OfficeLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar/Navegação lateral */}
      <aside className="w-64 bg-white border-r border-gray-200 p-4 hidden md:block">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800">Escritório DPO</h2>
          <p className="text-sm text-gray-500">Gestão de Avaliações</p>
        </div>
        
        <nav className="space-y-1">
          <Link href="/office/dashboard" passHref>
            <Button variant="ghost" className="w-full justify-start">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          
          <Link href="/office/dashboard?tab=pending" passHref>
            <Button variant="ghost" className="w-full justify-start">
              <ClipboardList className="mr-2 h-4 w-4" />
              Avaliações Pendentes
            </Button>
          </Link>
          
          <Link href="/office/dashboard?tab=completed" passHref>
            <Button variant="ghost" className="w-full justify-start">
              <BarChart3 className="mr-2 h-4 w-4" />
              Avaliações Concluídas
            </Button>
          </Link>
          
          <Link href="/suppliers" passHref>
            <Button variant="ghost" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Fornecedores
            </Button>
          </Link>
          
          <div className="pt-4 mt-4 border-t border-gray-200">
            <Link href="/office/settings" passHref>
              <Button variant="ghost" className="w-full justify-start text-gray-600">
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </Button>
            </Link>
            
            <Button variant="ghost" className="w-full justify-start text-gray-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </nav>
      </aside>
      
      {/* Conteúdo principal */}
      <main className="flex-1 overflow-auto">
        {/* Header móvel */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Escritório DPO</h2>
          <Button variant="outline" size="sm">Menu</Button>
        </header>
        
        {/* Conteúdo da página */}
        {children}
      </main>
    </div>
  )
}
export function Header() {
  return (
    <header className="bg-navy shadow-sm py-4 px-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="md:hidden">
          {/* Espaço reservado para o botão do menu mobile que já está no componente Sidebar */}
        </div>
        <div className="hidden md:block">
          <h1 className="text-lg md:text-xl font-semibold text-white">
            Sistema de Gestão de Riscos na Contratação de Fornecedores
          </h1>
        </div>
        <div className="md:hidden">
          <h1 className="text-sm font-semibold text-white">Gestão de Riscos</h1>
        </div>
        <div className="flex items-center space-x-4">
          {/* Área para componentes adicionais no cabeçalho */}
        </div>
      </div>
    </header>
  )
}

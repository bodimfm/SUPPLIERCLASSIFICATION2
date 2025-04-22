"use client"

import { useState } from "react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  FileText, 
  BookOpen,
  ExternalLink,
  Download,
  Globe,
  Bookmark,
  CheckCircle2,
  BookMarked
} from "lucide-react"

// Dados de exemplo para os frameworks
const frameworksData = [
  {
    id: "ISO-31000",
    name: "ISO 31000",
    type: "Standard",
    category: "Gestão de Riscos",
    description: "Framework internacional para gestão de riscos que fornece princípios, estrutura e um processo para gerenciar riscos em qualquer organização.",
    keyComponents: [
      "Princípios da Gestão de Riscos",
      "Estrutura da Gestão de Riscos",
      "Processo de Gestão de Riscos"
    ],
    benefits: [
      "Abordagem sistemática para gerenciar riscos",
      "Melhora a identificação de ameaças e oportunidades",
      "Aumenta a probabilidade de atingir objetivos",
      "Melhora a governança corporativa"
    ],
    resources: [
      {
        title: "Texto completo da norma ISO 31000",
        type: "document",
        url: "#"
      },
      {
        title: "Guia de implementação ISO 31000",
        type: "guide",
        url: "#"
      }
    ],
    relatedFrameworks: ["ISO 27036", "COSO ERM"]
  },
  {
    id: "ISO-27036",
    name: "ISO 27036",
    type: "Standard",
    category: "Segurança da Informação",
    description: "Conjunto de normas que fornecem orientações para segurança da informação nas relações com fornecedores, incluindo aquisição de produtos e serviços, e terceirização.",
    keyComponents: [
      "Visão geral e conceitos (Parte 1)",
      "Requisitos comuns (Parte 2)",
      "Segurança na cadeia de suprimentos de TIC (Parte 3)",
      "Segurança em serviços em nuvem (Parte 4)"
    ],
    benefits: [
      "Reduz riscos na cadeia de fornecimento",
      "Melhora a segurança em relações com terceiros",
      "Define requisitos claros para fornecedores",
      "Aprimora governança das relações com fornecedores"
    ],
    resources: [
      {
        title: "Texto completo da norma ISO 27036",
        type: "document",
        url: "#"
      },
      {
        title: "Guia prático de implementação",
        type: "guide",
        url: "#"
      }
    ],
    relatedFrameworks: ["ISO 31000", "ISO 27001"]
  },
  {
    id: "LGPD",
    name: "LGPD",
    type: "Regulation",
    category: "Proteção de Dados",
    description: "Lei Geral de Proteção de Dados - Legislação brasileira que estabelece regras sobre coleta, armazenamento, tratamento e compartilhamento de dados pessoais.",
    keyComponents: [
      "Princípios para tratamento de dados",
      "Direitos dos titulares",
      "Responsabilidades dos controladores e operadores",
      "Base legal para tratamento",
      "Transferência internacional de dados",
      "Sanções administrativas"
    ],
    benefits: [
      "Conformidade legal",
      "Aumento da confiança dos clientes",
      "Melhores práticas na gestão de dados",
      "Redução de riscos de violações de dados"
    ],
    resources: [
      {
        title: "Texto completo da LGPD",
        type: "document",
        url: "#"
      },
      {
        title: "Guia de adequação à LGPD",
        type: "guide",
        url: "#"
      }
    ],
    relatedFrameworks: ["GDPR", "ISO 27701"]
  },
  {
    id: "COSO-ERM",
    name: "COSO ERM",
    type: "Framework",
    category: "Gestão de Riscos",
    description: "Framework que fornece diretrizes para gerenciamento de riscos corporativos, controles internos e prevenção de fraudes.",
    keyComponents: [
      "Governança e Cultura",
      "Estratégia e Definição de Objetivos",
      "Desempenho",
      "Análise e Revisão",
      "Informação, Comunicação e Reporte"
    ],
    benefits: [
      "Alinhamento entre riscos e estratégia",
      "Melhoria na tomada de decisões",
      "Redução da volatilidade no desempenho",
      "Aprimoramento da alocação de recursos"
    ],
    resources: [
      {
        title: "Framework COSO ERM 2017",
        type: "document",
        url: "#"
      },
      {
        title: "Guia de implementação COSO",
        type: "guide",
        url: "#"
      }
    ],
    relatedFrameworks: ["ISO 31000", "COBIT"]
  },
];

// Componente para badge de tipo de framework
function FrameworkTypeBadge({ type }: { type: string }) {
  const getVariant = () => {
    switch (type) {
      case 'Standard':
        return 'default';
      case 'Regulation':
        return 'destructive';
      case 'Framework':
        return 'secondary';
      default:
        return 'outline';
    }
  };
  
  return <Badge variant={getVariant() as any}>{type}</Badge>;
}

// Componente para card de recurso
function ResourceCard({ resource }: { resource: { title: string; type: string; url: string } }) {
  const getIcon = () => {
    switch (resource.type) {
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'guide':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };
  
  return (
    <div className="flex items-center gap-2 p-3 border rounded-md hover:bg-accent cursor-pointer">
      {getIcon()}
      <span>{resource.title}</span>
      <ExternalLink className="h-3 w-3 ml-auto" />
    </div>
  );
}

export default function FrameworksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Função para filtrar os frameworks com base na busca
  const filteredFrameworks = frameworksData.filter(framework =>
    framework.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    framework.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    framework.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Frameworks e Normas</h1>
        <p className="text-muted-foreground">
          Biblioteca de referência para frameworks, normas e regulamentos relacionados ao GRC
        </p>
      </div>
      
      {/* Ferramentas de busca */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar frameworks, normas ou regulamentos..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </div>
      
      {/* Cards de Frameworks em Destaque */}
      <h2 className="text-xl font-semibold mb-4">Frameworks em Destaque</h2>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center gap-2">
            <div className="rounded-full bg-primary/20 p-2">
              <BookMarked className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">ISO 31000</CardTitle>
              <CardDescription>Gestão de Riscos</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Framework internacional para gestão de riscos que fornece princípios, 
              estrutura e um processo para gerenciar riscos.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">Ver Detalhes</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center gap-2">
            <div className="rounded-full bg-primary/20 p-2">
              <BookMarked className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">ISO 27036</CardTitle>
              <CardDescription>Segurança com Fornecedores</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Conjunto de normas que fornecem orientações para segurança da informação 
              nas relações com fornecedores.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">Ver Detalhes</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center gap-2">
            <div className="rounded-full bg-primary/20 p-2">
              <Globe className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">LGPD</CardTitle>
              <CardDescription>Proteção de Dados</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Legislação brasileira que estabelece regras sobre coleta, armazenamento, 
              tratamento e compartilhamento de dados pessoais.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">Ver Detalhes</Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Lista de Frameworks */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="standards">Normas</TabsTrigger>
          <TabsTrigger value="regulations">Regulamentos</TabsTrigger>
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Biblioteca de Referência</CardTitle>
              <CardDescription>
                Todos os frameworks, normas e regulamentos disponíveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {filteredFrameworks.map((framework) => (
                  <AccordionItem key={framework.id} value={framework.id}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-3 text-left">
                        <span className="font-medium">{framework.name}</span>
                        <FrameworkTypeBadge type={framework.type} />
                        <span className="text-sm text-muted-foreground ml-2">{framework.category}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <div>
                          <h3 className="font-medium mb-1">Descrição</h3>
                          <p className="text-sm text-muted-foreground">{framework.description}</p>
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-1">Componentes Principais</h3>
                          <ul className="text-sm space-y-1 list-disc pl-5">
                            {framework.keyComponents.map((component, index) => (
                              <li key={index}>{component}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-1">Benefícios</h3>
                          <ul className="text-sm space-y-1 list-disc pl-5">
                            {framework.benefits.map((benefit, index) => (
                              <li key={index}>{benefit}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-2">Recursos</h3>
                          <div className="grid gap-2">
                            {framework.resources.map((resource, index) => (
                              <ResourceCard key={index} resource={resource} />
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-1">Frameworks Relacionados</h3>
                          <div className="flex flex-wrap gap-2">
                            {framework.relatedFrameworks.map((related, index) => (
                              <Badge key={index} variant="outline" className="cursor-pointer">
                                {related}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="standards">
          <Card>
            <CardHeader>
              <CardTitle>Normas</CardTitle>
              <CardDescription>
                Documentos que fornecem requisitos, especificações, diretrizes ou características
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {filteredFrameworks
                  .filter(framework => framework.type === "Standard")
                  .map((framework) => (
                    <AccordionItem key={framework.id} value={framework.id}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-3 text-left">
                          <span className="font-medium">{framework.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">{framework.category}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          <p className="text-sm text-muted-foreground">{framework.description}</p>
                          
                          <div>
                            <h3 className="font-medium mb-1">Recursos</h3>
                            <div className="grid gap-2">
                              {framework.resources.map((resource, index) => (
                                <ResourceCard key={index} resource={resource} />
                              ))}
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="regulations">
          <Card>
            <CardHeader>
              <CardTitle>Regulamentos</CardTitle>
              <CardDescription>
                Leis e regulamentações que devem ser cumpridas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {filteredFrameworks
                  .filter(framework => framework.type === "Regulation")
                  .map((framework) => (
                    <AccordionItem key={framework.id} value={framework.id}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-3 text-left">
                          <span className="font-medium">{framework.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">{framework.category}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          <p className="text-sm text-muted-foreground">{framework.description}</p>
                          
                          <div>
                            <h3 className="font-medium mb-1">Recursos</h3>
                            <div className="grid gap-2">
                              {framework.resources.map((resource, index) => (
                                <ResourceCard key={index} resource={resource} />
                              ))}
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="frameworks">
          <Card>
            <CardHeader>
              <CardTitle>Frameworks</CardTitle>
              <CardDescription>
                Estruturas conceituais que servem como guia para soluções específicas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {filteredFrameworks
                  .filter(framework => framework.type === "Framework")
                  .map((framework) => (
                    <AccordionItem key={framework.id} value={framework.id}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-3 text-left">
                          <span className="font-medium">{framework.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">{framework.category}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          <p className="text-sm text-muted-foreground">{framework.description}</p>
                          
                          <div>
                            <h3 className="font-medium mb-1">Recursos</h3>
                            <div className="grid gap-2">
                              {framework.resources.map((resource, index) => (
                                <ResourceCard key={index} resource={resource} />
                              ))}
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
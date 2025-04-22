"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClipboardCheck, Mail, ShieldCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"

export default function CompliancePage() {
  const [formData, setFormData] = useState({
    // Informações Gerais do Fornecedor
    companyName: "",
    tradeName: "",
    cnpj: "",
    contactEmail: "",
    
    // Governança de Proteção de Dados
    hasDpo: false,
    hasPrivacyPolicy: false,
    governanceProgram: "",
    
    // Dados Tratados & Bases Legais
    dataTypes: [] as string[],
    hasSensitiveData: false,
    legalBases: [] as string[],
    
    // Segurança da Informação
    encryptionAtRest: false,
    encryptionInTransit: false,
    usesMfa: false,
    logsRetention: "",
    recentPentest: false,
    securityFrameworks: [] as string[],
    
    // Gestão de Incidentes & Continuidade
    hasIncidentResponse: false,
    reportTimeframe: "",
    testsDrp: false,
    
    // Subcontratados & Cadeia de Suprimento
    usesSubprocessors: false,
    evaluatesSubprocessors: "",
    subprocessorContracts: false,
    
    // Direitos dos Titulares
    hasSubjectRightsChannel: false,
    responseTimeframeDays: 0,
    
    // Transferências Internacionais
    transfersDataAbroad: false,
    transferMechanisms: [] as string[],
    
    // Conformidade & Certificações
    certifications: [] as string[],
    hasExternalAudits: false,
    hadViolations: false,
    
    // Risco & Monitoramento Contínuo
    performsRiskAssessment: false,
    securityKpis: "",
    agreesToAudits: false,
  })

  const [activeTab, setActiveTab] = useState("general")
  const [generatedLink, setGeneratedLink] = useState("")
  const [submitted, setSubmitted] = useState(false)

  // Opções para os campos de múltipla escolha
  const dataTypeOptions = [
    { id: "name", label: "Nome completo" },
    { id: "email", label: "E-mail" },
    { id: "phone", label: "Telefone" },
    { id: "address", label: "Endereço" },
    { id: "id_documents", label: "Documentos de identificação" },
    { id: "financial", label: "Dados financeiros/bancários" },
    { id: "health", label: "Dados de saúde" },
    { id: "biometric", label: "Dados biométricos" },
    { id: "location", label: "Localização/geolocalização" },
    { id: "behavioral", label: "Dados comportamentais" },
  ]

  const legalBaseOptions = [
    { id: "consent", label: "Consentimento (Art. 7, I)" },
    { id: "legal_obligation", label: "Obrigação legal (Art. 7, II)" },
    { id: "contract", label: "Execução de contrato (Art. 7, V)" },
    { id: "legitimate_interest", label: "Legítimo interesse (Art. 7, IX)" },
    { id: "public_policy", label: "Políticas públicas (Art. 7, III)" },
    { id: "research", label: "Estudos e pesquisas (Art. 7, IV)" },
    { id: "judicial", label: "Exercício de direitos (Art. 7, VI)" },
    { id: "health_protection", label: "Proteção da saúde (Art. 7, VIII)" },
    { id: "credit_protection", label: "Proteção ao crédito (Art. 7, X)" },
  ]

  const securityFrameworkOptions = [
    { id: "iso_27001", label: "ISO 27001" },
    { id: "iso_27701", label: "ISO 27701" },
    { id: "cis_controls", label: "CIS Controls" },
    { id: "nist", label: "NIST Cybersecurity Framework" },
    { id: "pci_dss", label: "PCI DSS" },
    { id: "soc2", label: "SOC 2" },
    { id: "cobit", label: "COBIT" },
  ]

  const transferMechanismOptions = [
    { id: "sccs", label: "Cláusulas contratuais padrão" },
    { id: "adequacy", label: "Decisão de adequação" },
    { id: "consent", label: "Consentimento específico" },
    { id: "contract", label: "Necessário para execução do contrato" },
    { id: "legal_claims", label: "Exercício de direitos em processo" },
    { id: "public_interest", label: "Interesse público" },
    { id: "binding_rules", label: "Regras corporativas vinculantes" },
  ]

  const certificationOptions = [
    { id: "iso_27001", label: "ISO 27001" },
    { id: "iso_27701", label: "ISO 27701" },
    { id: "soc2", label: "SOC 2" },
    { id: "lgpd_cert", label: "Certificação LGPD" },
    { id: "iso_31000", label: "ISO 31000" },
  ]

  // Funções para atualizar o estado do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleMultiCheckboxChange = (field: string, itemId: string, checked: boolean) => {
    setFormData(prev => {
      const currentValues = [...(prev[field as keyof typeof prev] as string[])]
      if (checked) {
        return { ...prev, [field]: [...currentValues, itemId] }
      } else {
        return { ...prev, [field]: currentValues.filter(id => id !== itemId) }
      }
    })
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }))
  }

  // Função para criar o link do formulário
  const generateAssessmentLink = async () => {
    // Aqui você integraria com sua API para criar uma avaliação no banco de dados
    // e gerar um link único para o fornecedor
    
    // Simulação do processo
    const uniqueId = Math.random().toString(36).substring(2, 15)
    const link = `${window.location.origin}/supplier-assessment/${uniqueId}`
    
    setGeneratedLink(link)
    
    // Notificar o usuário
    toast({
      title: "Link de avaliação gerado",
      description: "O link foi criado e está pronto para ser enviado ao fornecedor.",
    })
  }

  // Função para enviar o link por e-mail
  const sendAssessmentEmail = async () => {
    // Aqui você integraria com sua API para enviar o e-mail ao fornecedor
    
    // Simulação do processo
    setTimeout(() => {
      toast({
        title: "E-mail enviado com sucesso",
        description: `Avaliação enviada para ${formData.contactEmail}`,
      })
    }, 1000)
  }

  // Função para enviar o formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    toast({
      title: "Modelo de avaliação salvo",
      description: "O template foi salvo com sucesso e está pronto para ser enviado aos fornecedores.",
    })
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Compliance - Avaliação de Fornecedores</h1>
          <p className="text-muted-foreground">
            Configure o formulário de avaliação LGPD e cibersegurança para fornecedores
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full md:w-fit">
          <TabsTrigger value="general">Configuração</TabsTrigger>
          <TabsTrigger value="template">Template de Avaliação</TabsTrigger>
          <TabsTrigger value="send">Enviar Avaliação</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configuração da Avaliação</CardTitle>
              <CardDescription>
                Configure os parâmetros básicos da avaliação de fornecedores.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="assessmentName">Nome da Avaliação</Label>
                <Input 
                  id="assessmentName" 
                  placeholder="Ex: Avaliação LGPD e Cibersegurança 2025" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assessmentDescription">Descrição</Label>
                <Textarea 
                  id="assessmentDescription" 
                  placeholder="Explique o propósito desta avaliação para os fornecedores"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Exigir Evidências</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox id="requireEvidences" />
                  <label
                    htmlFor="requireEvidences"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Solicitar upload de documentos comprobatórios
                  </label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expirationDays">Prazo para Resposta (dias)</Label>
                <Input 
                  id="expirationDays" 
                  type="number" 
                  min={1}
                  placeholder="Ex: 15" 
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setActiveTab("template")}>
                Configurar Template
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="template">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Template de Avaliação de Fornecedores</CardTitle>
                <CardDescription>
                  Configure as perguntas que serão enviadas aos fornecedores.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Seção 1: Informações Gerais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">1 · Informações Gerais do Fornecedor</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="companyName">1️⃣ Razão social</Label>
                    <p className="text-sm text-muted-foreground">Para começarmos, qual é a razão social completa da sua empresa? (Precisamos identificar juridicamente o fornecedor.)</p>
                    <Input 
                      id="companyName" 
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="Razão social completa" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tradeName">2️⃣ Nome fantasia</Label>
                    <p className="text-sm text-muted-foreground">Como sua empresa é conhecida comercialmente? (Facilita buscas e exibição.)</p>
                    <Input 
                      id="tradeName" 
                      name="tradeName"
                      value={formData.tradeName}
                      onChange={handleInputChange}
                      placeholder="Nome fantasia" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">3️⃣ CNPJ válido</Label>
                    <p className="text-sm text-muted-foreground">Poderia informar o CNPJ (14 dígitos)? (Confirma unicidade e situação fiscal.)</p>
                    <Input 
                      id="cnpj" 
                      name="cnpj"
                      value={formData.cnpj}
                      onChange={handleInputChange}
                      placeholder="00.000.000/0000-00" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">4️⃣ Contato principal</Label>
                    <p className="text-sm text-muted-foreground">Qual e‑mail devemos usar para assuntos de proteção de dados? (Canal oficial de comunicação.)</p>
                    <Input 
                      id="contactEmail" 
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      type="email"
                      placeholder="email@example.com" 
                    />
                  </div>
                </div>
                
                {/* Seção 2: Governança de Proteção de Dados */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">2 · Governança de Proteção de Dados</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hasDpo">5️⃣ DPO designado</Label>
                    <p className="text-sm text-muted-foreground">Sua empresa nomeou formalmente um Encarregado/DPO? (Exigência art. 41 LGPD.)</p>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="hasDpo" 
                        checked={formData.hasDpo}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange("hasDpo", checked === true)
                        }
                      />
                      <label
                        htmlFor="hasDpo"
                        className="text-sm font-medium leading-none"
                      >
                        Sim, temos um DPO formalmente designado
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hasPrivacyPolicy">6️⃣ Política de privacidade</Label>
                    <p className="text-sm text-muted-foreground">Possui política de privacidade publicada e atualizada? (Avalia transparência.)</p>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="hasPrivacyPolicy" 
                        checked={formData.hasPrivacyPolicy}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange("hasPrivacyPolicy", checked === true)
                        }
                      />
                      <label
                        htmlFor="hasPrivacyPolicy"
                        className="text-sm font-medium leading-none"
                      >
                        Sim, temos política de privacidade publicada
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="governanceProgram">7️⃣ Programa de governança</Label>
                    <p className="text-sm text-muted-foreground">Existe programa de governança em privacidade implementado (ISO 27701, etc.)? (Mede maturidade.)</p>
                    <Select 
                      onValueChange={(value) => handleSelectChange("governanceProgram", value)}
                      value={formData.governanceProgram}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma opção" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Sim</SelectItem>
                        <SelectItem value="partial">Parcial</SelectItem>
                        <SelectItem value="no">Não</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Seção 3: Dados Tratados & Bases Legais */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">3 · Dados Tratados & Bases Legais</h3>
                  
                  <div className="space-y-2">
                    <Label>8️⃣ Tipos de dados</Label>
                    <p className="text-sm text-muted-foreground">Quais categorias de dados pessoais você tratará em nosso contrato? (Permite mapear sensibilidade.)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      {dataTypeOptions.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`dataType-${option.id}`} 
                            checked={formData.dataTypes.includes(option.id)}
                            onCheckedChange={(checked) => 
                              handleMultiCheckboxChange("dataTypes", option.id, checked === true)
                            }
                          />
                          <label
                            htmlFor={`dataType-${option.id}`}
                            className="text-sm font-medium leading-none"
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hasSensitiveData">9️⃣ Dados sensíveis</Label>
                    <p className="text-sm text-muted-foreground">Essas atividades envolvem dados pessoais sensíveis? (Ativa controles reforçados art. 11 LGPD.)</p>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="hasSensitiveData" 
                        checked={formData.hasSensitiveData}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange("hasSensitiveData", checked === true)
                        }
                      />
                      <label
                        htmlFor="hasSensitiveData"
                        className="text-sm font-medium leading-none"
                      >
                        Sim, envolve dados pessoais sensíveis
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>🔟 Bases legais declaradas</Label>
                    <p className="text-sm text-muted-foreground">Qual(is) base(s) legal(is) sustenta(m) o tratamento? (Verifica adequação jurídica.)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      {legalBaseOptions.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`legalBase-${option.id}`} 
                            checked={formData.legalBases.includes(option.id)}
                            onCheckedChange={(checked) => 
                              handleMultiCheckboxChange("legalBases", option.id, checked === true)
                            }
                          />
                          <label
                            htmlFor={`legalBase-${option.id}`}
                            className="text-sm font-medium leading-none"
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Seção 4: Segurança da Informação */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">4 · Segurança da Informação</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="encryptionAtRest">1️⃣1️⃣ Criptografia em repouso</Label>
                    <p className="text-sm text-muted-foreground">Os dados armazenados são criptografados em repouso? (Controle técnico essencial.)</p>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="encryptionAtRest" 
                        checked={formData.encryptionAtRest}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange("encryptionAtRest", checked === true)
                        }
                      />
                      <label
                        htmlFor="encryptionAtRest"
                        className="text-sm font-medium leading-none"
                      >
                        Sim, utilizamos criptografia para dados em repouso
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="encryptionInTransit">1️⃣2️⃣ Criptografia em trânsito</Label>
                    <p className="text-sm text-muted-foreground">Comunicações usam TLS 1.2+ ou superior? (Garante confidencialidade.)</p>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="encryptionInTransit" 
                        checked={formData.encryptionInTransit}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange("encryptionInTransit", checked === true)
                        }
                      />
                      <label
                        htmlFor="encryptionInTransit"
                        className="text-sm font-medium leading-none"
                      >
                        Sim, utilizamos TLS 1.2+ ou superior
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="usesMfa">1️⃣3️⃣ Gestão de acesso</Label>
                    <p className="text-sm text-muted-foreground">Utilizam MFA para contas administrativas? (Reduz risco de violação.)</p>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="usesMfa" 
                        checked={formData.usesMfa}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange("usesMfa", checked === true)
                        }
                      />
                      <label
                        htmlFor="usesMfa"
                        className="text-sm font-medium leading-none"
                      >
                        Sim, utilizamos MFA para contas administrativas
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="logsRetention">1️⃣4️⃣ Registro de logs</Label>
                    <p className="text-sm text-muted-foreground">Logs de segurança são coletados e retidos ≥ 6 meses? (Exigência ANPD recomendação nº 4/2023.)</p>
                    <Select 
                      onValueChange={(value) => handleSelectChange("logsRetention", value)}
                      value={formData.logsRetention}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma opção" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes_over_year">Sim, por mais de 12 meses</SelectItem>
                        <SelectItem value="yes_6_12">Sim, entre 6 e 12 meses</SelectItem>
                        <SelectItem value="yes_under_6">Sim, menos de 6 meses</SelectItem>
                        <SelectItem value="no">Não coletamos logs regularmente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="recentPentest">1️⃣5️⃣ Pentest recente</Label>
                    <p className="text-sm text-muted-foreground">Foi realizado teste de intrusão nos últimos 12 meses? (Avalia postura proativa.)</p>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="recentPentest" 
                        checked={formData.recentPentest}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange("recentPentest", checked === true)
                        }
                      />
                      <label
                        htmlFor="recentPentest"
                        className="text-sm font-medium leading-none"
                      >
                        Sim, realizamos pentest nos últimos 12 meses
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>1️⃣6️⃣ Normas adotadas</Label>
                    <p className="text-sm text-muted-foreground">Quais frameworks/normas de segurança seguem? (Ex.: ISO 27001, CIS Controls.)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      {securityFrameworkOptions.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`securityFramework-${option.id}`} 
                            checked={formData.securityFrameworks.includes(option.id)}
                            onCheckedChange={(checked) => 
                              handleMultiCheckboxChange("securityFrameworks", option.id, checked === true)
                            }
                          />
                          <label
                            htmlFor={`securityFramework-${option.id}`}
                            className="text-sm font-medium leading-none"
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Seção 5: Gestão de Incidentes & Continuidade */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">5 · Gestão de Incidentes & Continuidade</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hasIncidentResponse">1️⃣7️⃣ Plano de resposta</Label>
                    <p className="text-sm text-muted-foreground">Existe plano formal de resposta a incidentes? (Requisito de prontidão.)</p>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="hasIncidentResponse" 
                        checked={formData.hasIncidentResponse}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange("hasIncidentResponse", checked === true)
                        }
                      />
                      <label
                        htmlFor="hasIncidentResponse"
                        className="text-sm font-medium leading-none"
                      >
                        Sim, temos plano formal de resposta a incidentes
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reportTimeframe">1️⃣8️⃣ Prazo de reporte</Label>
                    <p className="text-sm text-muted-foreground">Compromete‑se a notificar incidentes envolvendo nossos dados em até 24 h? (Acordo de nível de serviço.)</p>
                    <Select 
                      onValueChange={(value) => handleSelectChange("reportTimeframe", value)}
                      value={formData.reportTimeframe}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma opção" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under_12h">Sim, em até 12 horas</SelectItem>
                        <SelectItem value="under_24h">Sim, em até 24 horas</SelectItem>
                        <SelectItem value="under_48h">Sim, em até 48 horas</SelectItem>
                        <SelectItem value="over_48h">Mais de 48 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="testsDrp">1️⃣9️⃣ Testes de DRP/BCP</Label>
                    <p className="text-sm text-muted-foreground">Planos de continuidade são testados ao menos anualmente? (Verifica eficácia.)</p>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="testsDrp" 
                        checked={formData.testsDrp}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange("testsDrp", checked === true)
                        }
                      />
                      <label
                        htmlFor="testsDrp"
                        className="text-sm font-medium leading-none"
                      >
                        Sim, testamos nossos planos de continuidade anualmente
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Seção 6: Subcontratados & Cadeia de Suprimento */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">6 · Subcontratados & Cadeia de Suprimento</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="usesSubprocessors">2️⃣0️⃣ Uso de subprocessadores</Label>
                    <p className="text-sm text-muted-foreground">Sua empresa repassa dados pessoais a subcontratados? (Identifica terceirizações.)</p>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="usesSubprocessors" 
                        checked={formData.usesSubprocessors}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange("usesSubprocessors", checked === true)
                        }
                      />
                      <label
                        htmlFor="usesSubprocessors"
                        className="text-sm font-medium leading-none"
                      >
                        Sim, repassamos dados a subcontratados
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="evaluatesSubprocessors">2️⃣1️⃣ Avaliação de terceiros</Label>
                    <p className="text-sm text-muted-foreground">Avalia o compliance de cada subprocessador antes da contratação? (Risco em cascata.)</p>
                    <Select 
                      onValueChange={(value) => handleSelectChange("evaluatesSubprocessors", value)}
                      value={formData.evaluatesSubprocessors}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma opção" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="always">Sim, sempre</SelectItem>
                        <SelectItem value="sometimes">Às vezes, depende do caso</SelectItem>
                        <SelectItem value="never">Não avaliamos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subprocessorContracts">2️⃣2️⃣ Contrato com cláusulas LGPD</Label>
                    <p className="text-sm text-muted-foreground">Os contratos com subprocessadores contêm cláusulas específicas de proteção de dados? (Minimiza exposição jurídica.)</p>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="subprocessorContracts" 
                        checked={formData.subprocessorContracts}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange("subprocessorContracts", checked === true)
                        }
                      />
                      <label
                        htmlFor="subprocessorContracts"
                        className="text-sm font-medium leading-none"
                      >
                        Sim, nossos contratos incluem cláusulas de proteção de dados
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Seção 7: Direitos dos Titulares */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">7 · Direitos dos Titulares</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hasSubjectRightsChannel">2️⃣3️⃣ Canal de requisições</Label>
                    <p className="text-sm text-muted-foreground">Há canal dedicado para solicitações de titulares (art. 18 LGPD)? (Exigência de transparência.)</p>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="hasSubjectRightsChannel" 
                        checked={formData.hasSubjectRightsChannel}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange("hasSubjectRightsChannel", checked === true)
                        }
                      />
                      <label
                        htmlFor="hasSubjectRightsChannel"
                        className="text-sm font-medium leading-none"
                      >
                        Sim, temos canal dedicado para direitos dos titulares
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="responseTimeframeDays">2️⃣4️⃣ Prazo de atendimento</Label>
                    <p className="text-sm text-muted-foreground">Qual o prazo médio para responder a um titular? (Mede eficiência.)</p>
                    <Input 
                      id="responseTimeframeDays" 
                      name="responseTimeframeDays"
                      type="number"
                      min={0}
                      value={formData.responseTimeframeDays || ""}
                      onChange={handleNumberChange}
                      placeholder="Número de dias" 
                    />
                  </div>
                </div>
                
                {/* Seção 8: Transferências Internacionais */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">8 · Transferências Internacionais</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="transfersDataAbroad">2️⃣5️⃣ Dados fora do Brasil</Label>
                    <p className="text-sm text-muted-foreground">Dados pessoais serão transferidos para fora do Brasil? (Aciona art. 33 LGPD.)</p>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="transfersDataAbroad" 
                        checked={formData.transfersDataAbroad}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange("transfersDataAbroad", checked === true)
                        }
                      />
                      <label
                        htmlFor="transfersDataAbroad"
                        className="text-sm font-medium leading-none"
                      >
                        Sim, transferimos dados para fora do Brasil
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>2️⃣6️⃣ Bases de transferência</Label>
                    <p className="text-sm text-muted-foreground">Qual mecanismo legitima essa transferência? (Cláusulas‑padrão, adequação, consentimento, etc.)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      {transferMechanismOptions.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`transferMechanism-${option.id}`} 
                            checked={formData.transferMechanisms.includes(option.id)}
                            onCheckedChange={(checked) => 
                              handleMultiCheckboxChange("transferMechanisms", option.id, checked === true)
                            }
                          />
                          <label
                            htmlFor={`transferMechanism-${option.id}`}
                            className="text-sm font-medium leading-none"
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Seção 9: Conformidade & Certificações */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">9 · Conformidade & Certificações</h3>
                  
                  <div className="space-y-2">
                    <Label>2️⃣7️⃣ Certificação ISO 27001/27701</Label>
                    <p className="text-sm text-muted-foreground">Sua organização possui certificação ISO 27001, 27701 ou similar? (Evidência de controle maduro.)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      {certificationOptions.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`certification-${option.id}`} 
                            checked={formData.certifications.includes(option.id)}
                            onCheckedChange={(checked) => 
                              handleMultiCheckboxChange("certifications", option.id, checked === true)
                            }
                          />
                          <label
                            htmlFor={`certification-${option.id}`}
                            className="text-sm font-medium leading-none"
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hasExternalAudits">2️⃣8️⃣ Auditorias externas</Label>
                    <p className="text-sm text-muted-foreground">Apresenta relatórios de auditoria externa (SOC 2, ISAE 3000)? (Transparência independente.)</p>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="hasExternalAudits" 
                        checked={formData.hasExternalAudits}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange("hasExternalAudits", checked === true)
                        }
                      />
                      <label
                        htmlFor="hasExternalAudits"
                        className="text-sm font-medium leading-none"
                      >
                        Sim, realizamos auditorias externas regularmente
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hadViolations">2️⃣9️⃣ Histórico de infrações</Label>
                    <p className="text-sm text-muted-foreground">Houve penalidades LGPD ou vazamentos públicos nos últimos 3 anos? (Indicador de risco reputacional.)</p>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="hadViolations" 
                        checked={formData.hadViolations}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange("hadViolations", checked === true)
                        }
                      />
                      <label
                        htmlFor="hadViolations"
                        className="text-sm font-medium leading-none"
                      >
                        Sim, tivemos incidentes ou penalidades nos últimos 3 anos
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Seção 10: Risco & Monitoramento Contínuo */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">10 · Risco & Monitoramento Contínuo</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="performsRiskAssessment">3️⃣0️⃣ Avaliação de risco periódico</Label>
                    <p className="text-sm text-muted-foreground">Realiza avaliação de risco em proteção de dados pelo menos anual? (Ciclo ISO 31000.)</p>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="performsRiskAssessment" 
                        checked={formData.performsRiskAssessment}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange("performsRiskAssessment", checked === true)
                        }
                      />
                      <label
                        htmlFor="performsRiskAssessment"
                        className="text-sm font-medium leading-none"
                      >
                        Sim, realizamos avaliações de risco periódicas
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="securityKpis">3️⃣1️⃣ Indicadores de segurança</Label>
                    <p className="text-sm text-muted-foreground">Quais KPIs/KRIs de segurança acompanha regularmente? (Permite monitorar desempenho.)</p>
                    <Textarea 
                      id="securityKpis" 
                      name="securityKpis"
                      value={formData.securityKpis}
                      onChange={handleInputChange}
                      placeholder="Liste os principais indicadores monitorados" 
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="agreesToAudits">3️⃣2️⃣ Compromisso de melhoria</Label>
                    <p className="text-sm text-muted-foreground">Concorda em participar de auditorias conjuntas e apresentar plano de ação quando necessário? (Governança colaborativa.)</p>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="agreesToAudits" 
                        checked={formData.agreesToAudits}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange("agreesToAudits", checked === true)
                        }
                      />
                      <label
                        htmlFor="agreesToAudits"
                        className="text-sm font-medium leading-none"
                      >
                        Sim, concordamos com auditorias conjuntas e planos de ação
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("general")}>
                  Voltar
                </Button>
                <Button type="submit">
                  Salvar Template
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="send">
          <Card>
            <CardHeader>
              <CardTitle>Enviar Avaliação para Fornecedores</CardTitle>
              <CardDescription>
                Gere links personalizados e envie para os fornecedores responderem a avaliação.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!submitted ? (
                <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ShieldCheck className="h-5 w-5 text-amber-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-amber-800">Modelo não configurado</h3>
                      <div className="mt-2 text-sm text-amber-700">
                        <p>Você precisa configurar e salvar o template de avaliação antes de enviá-lo.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="supplierEmail">E-mail do Fornecedor</Label>
                    <Input 
                      id="supplierEmail" 
                      placeholder="fornecedor@exemplo.com" 
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="messageText">Mensagem Personalizada</Label>
                    <Textarea 
                      id="messageText" 
                      placeholder="Mensagem que será enviada junto com o link de avaliação"
                      rows={4}
                      defaultValue={`Prezado fornecedor,

Solicitamos que responda nossa avaliação de fornecedores focada em LGPD e cibersegurança. Esta avaliação é importante para garantir a conformidade de nossa cadeia de suprimentos.

Prazo para resposta: 15 dias.`}
                    />
                  </div>
                  
                  {generatedLink ? (
                    <div className="space-y-2">
                      <Label>Link de Avaliação</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={generatedLink} 
                          readOnly 
                          className="flex-1"
                        />
                        <Button variant="outline" onClick={() => {
                          navigator.clipboard.writeText(generatedLink);
                          toast({
                            title: "Link copiado",
                            description: "O link foi copiado para a área de transferência.",
                          });
                        }}>
                          Copiar
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setActiveTab("template")}
              >
                Voltar ao Template
              </Button>
              
              <div className="flex gap-2">
                {submitted && (
                  <>
                    {!generatedLink ? (
                      <Button onClick={generateAssessmentLink}>
                        <ClipboardCheck className="mr-2 h-4 w-4" />
                        Gerar Link
                      </Button>
                    ) : (
                      <Button onClick={sendAssessmentEmail}>
                        <Mail className="mr-2 h-4 w-4" />
                        Enviar por E-mail
                      </Button>
                    )}
                  </>
                )}
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
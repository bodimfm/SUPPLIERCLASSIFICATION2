"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"
import { AlertCircle, CheckCircle, ArrowRight, ArrowLeft, Send, Upload } from "lucide-react"

export default function SupplierAssessmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const assessmentId = searchParams.get("id") || "default"
  
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

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [assessmentInfo, setAssessmentInfo] = useState({
    title: "Avaliação de Fornecedores - LGPD e Cibersegurança",
    description: "Esta avaliação visa garantir a conformidade dos fornecedores com a LGPD e as melhores práticas de cibersegurança. Por favor, complete todas as seções com informações precisas.",
    companyName: "Empresa Solicitante",
    deadline: "15 dias",
    requireEvidence: true
  })
  
  // Total de etapas no formulário
  const totalSteps = 10
  
  // Definir os tipos de dados disponíveis
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

  // Efeito para recuperar informações da avaliação
  useEffect(() => {
    const fetchAssessmentInfo = async () => {
      try {
        // Aqui seria a chamada à API para recuperar as informações da avaliação
        // Por enquanto, estamos usando dados simulados
        setLoading(true)
        setTimeout(() => {
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Erro ao carregar avaliação:", error)
        setLoading(false)
      }
    }

    fetchAssessmentInfo()
  }, [assessmentId])

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setUploadedFiles(prev => [...prev, ...newFiles])
    }
  }

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Função para navegar para a próxima etapa
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prevStep => prevStep + 1)
      window.scrollTo(0, 0)
    }
  }

  // Função para voltar à etapa anterior
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prevStep => prevStep - 1)
      window.scrollTo(0, 0)
    }
  }

  // Função para enviar o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Aqui você faria uma chamada à API para salvar os dados
      // Simulando uma chamada à API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSubmitted(true)
      toast({
        title: "Avaliação enviada com sucesso",
        description: "Obrigado por completar a avaliação. Suas respostas foram enviadas com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error)
      toast({
        title: "Erro ao enviar avaliação",
        description: "Ocorreu um erro ao enviar suas respostas. Por favor, tente novamente.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Renderizar formulário com base na etapa atual
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h3 className="text-lg font-medium mb-4">1 · Informações Gerais do Fornecedor</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">1️⃣ Razão social</Label>
                <p className="text-sm text-muted-foreground">Para começarmos, qual é a razão social completa da sua empresa? (Precisamos identificar juridicamente o fornecedor.)</p>
                <Input 
                  id="companyName" 
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Razão social completa" 
                  required
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
                  required
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
                  required
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
                  required
                />
              </div>
            </div>
          </>
        )
      case 2:
        return (
          <>
            <h3 className="text-lg font-medium mb-4">2 · Governança de Proteção de Dados</h3>
            
            <div className="space-y-4">
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
          </>
        )
      case 3:
        return (
          <>
            <h3 className="text-lg font-medium mb-4">3 · Dados Tratados & Bases Legais</h3>
            
            <div className="space-y-4">
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
          </>
        )
      case 4:
        return (
          <>
            <h3 className="text-lg font-medium mb-4">4 · Segurança da Informação</h3>
            
            <div className="space-y-4">
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
          </>
        )
      case 5:
        return (
          <>
            <h3 className="text-lg font-medium mb-4">5 · Gestão de Incidentes & Continuidade</h3>
            
            <div className="space-y-4">
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
          </>
        )
      case 6:
        return (
          <>
            <h3 className="text-lg font-medium mb-4">6 · Subcontratados & Cadeia de Suprimento</h3>
            
            <div className="space-y-4">
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
          </>
        )
      case 7:
        return (
          <>
            <h3 className="text-lg font-medium mb-4">7 · Direitos dos Titulares</h3>
            
            <div className="space-y-4">
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
          </>
        )
      case 8:
        return (
          <>
            <h3 className="text-lg font-medium mb-4">8 · Transferências Internacionais</h3>
            
            <div className="space-y-4">
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
              
              {formData.transfersDataAbroad && (
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
              )}
            </div>
          </>
        )
      case 9:
        return (
          <>
            <h3 className="text-lg font-medium mb-4">9 · Conformidade & Certificações</h3>
            
            <div className="space-y-4">
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
          </>
        )
      case 10:
        return (
          <>
            <h3 className="text-lg font-medium mb-4">10 · Risco & Monitoramento Contínuo</h3>
            
            <div className="space-y-4">
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
              
              {assessmentInfo.requireEvidence && (
                <div className="space-y-2 pt-4 border-t mt-6">
                  <Label>Evidências e Documentação</Label>
                  <p className="text-sm text-muted-foreground">
                    Por favor, forneça qualquer documentação relevante que comprove suas respostas 
                    (políticas, certificados, relatórios, etc.)
                  </p>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mt-2">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <p className="text-sm text-center text-muted-foreground">
                        Arraste e solte arquivos aqui ou clique para selecionar
                      </p>
                      <Input
                        id="fileUpload"
                        type="file"
                        className="hidden"
                        multiple
                        onChange={handleFileChange}
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('fileUpload')?.click()}
                      >
                        Selecionar Arquivos
                      </Button>
                    </div>
                  </div>
                  
                  {uploadedFiles.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Arquivos selecionados:</h4>
                      <ul className="space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <li key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                            <span className="text-sm truncate max-w-[200px] md:max-w-[400px]">
                              {file.name}
                            </span>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRemoveFile(index)}
                            >
                              Remover
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )
      default:
        return null
    }
  }

  // Renderiza a página de confirmação após o envio
  const renderConfirmation = () => {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold mb-2">Avaliação Enviada com Sucesso!</h3>
        <p className="text-muted-foreground mb-6">
          Obrigado por completar a avaliação. Suas respostas foram enviadas com sucesso e serão analisadas pela nossa equipe.
        </p>
        <div className="p-4 bg-muted rounded-lg mb-6">
          <p className="font-medium">ID da Avaliação: {assessmentId}</p>
          <p className="text-sm text-muted-foreground">Envio confirmado em: {new Date().toLocaleString()}</p>
        </div>
        <Button onClick={() => window.location.href = "/"}>
          Voltar para a página inicial
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4 mx-auto"></div>
          <p>Carregando avaliação...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {!submitted ? (
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>{assessmentInfo.title}</CardTitle>
            <CardDescription>{assessmentInfo.description}</CardDescription>
            <div className="mt-4">
              <p className="text-sm">
                <span className="font-medium">Solicitante:</span> {assessmentInfo.companyName}
              </p>
              <p className="text-sm">
                <span className="font-medium">Prazo para resposta:</span> {assessmentInfo.deadline}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">
                  Progresso: {Math.round((currentStep / totalSteps) * 100)}%
                </p>
                <p className="text-sm text-muted-foreground">
                  Etapa {currentStep} de {totalSteps}
                </p>
              </div>
              <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {renderStepContent()}
            </form>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>
            
            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={nextStep}
              >
                Próximo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Enviando...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Avaliação
                  </span>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      ) : (
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="pt-6">
            {renderConfirmation()}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
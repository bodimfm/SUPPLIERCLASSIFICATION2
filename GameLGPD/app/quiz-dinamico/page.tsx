"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DynamicQuiz from "@/components/dynamic-quiz"
import { QuestionSelectionMode } from "@/lib/question-service"
import OfficeHeader from "@/components/office-header"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Settings, Play } from "lucide-react"

export default function QuizDinamicoPage() {
  const [mode, setMode] = useState<QuestionSelectionMode>(QuestionSelectionMode.RANDOM)
  const [questionsPerSession, setQuestionsPerSession] = useState<number>(5)
  const [shuffleOptions, setShuffleOptions] = useState<boolean>(true)
  const [showExplanation, setShowExplanation] = useState<boolean>(true)
  const [showQuiz, setShowQuiz] = useState<boolean>(false)

  const handleStartQuiz = () => {
    setShowQuiz(true)
  }

  const handleResetQuiz = () => {
    setShowQuiz(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex flex-col items-center p-4">
      <div className="w-full max-w-6xl">
        <OfficeHeader />

        <div className="flex justify-center">
          <Card className="w-full max-w-4xl border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">Quiz Dinâmico sobre LGPD e Fornecedores</CardTitle>
            </CardHeader>
            <CardContent>
              {!showQuiz ? (
                <Tabs defaultValue="start">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="start">Iniciar Quiz</TabsTrigger>
                    <TabsTrigger value="settings">Configurações</TabsTrigger>
                  </TabsList>

                  <TabsContent value="start" className="space-y-6">
                    <div className="bg-blue-50 p-6 rounded-lg text-blue-700 border border-blue-100">
                      <h3 className="font-medium text-lg mb-2">Bem-vindo ao Quiz Dinâmico!</h3>
                      <p className="mb-4">
                        Este quiz contém perguntas sobre LGPD e avaliação de fornecedores. Teste seus conhecimentos e
                        aprenda mais sobre como proteger dados pessoais ao trabalhar com terceiros.
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Total de perguntas disponíveis: 20</li>
                        <li>Perguntas por sessão: {questionsPerSession}</li>
                        <li>Modo de seleção: {mode === QuestionSelectionMode.RANDOM ? "Aleatório" : "Sequencial"}</li>
                        <li>Opções embaralhadas: {shuffleOptions ? "Sim" : "Não"}</li>
                        <li>Mostrar explicações: {showExplanation ? "Sim" : "Não"}</li>
                      </ul>
                    </div>

                    <div className="flex justify-center">
                      <Button size="lg" onClick={handleStartQuiz} className="gap-2">
                        <Play className="h-4 w-4" /> Iniciar Quiz
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-6">
                    <div className="grid gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="mode">Modo de seleção de perguntas</Label>
                        <Select value={mode} onValueChange={(value) => setMode(value as QuestionSelectionMode)}>
                          <SelectTrigger id="mode">
                            <SelectValue placeholder="Selecione o modo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={QuestionSelectionMode.RANDOM}>Aleatório</SelectItem>
                            <SelectItem value={QuestionSelectionMode.SEQUENTIAL}>Sequencial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Número de perguntas por sessão: {questionsPerSession}</Label>
                        <Slider
                          value={[questionsPerSession]}
                          min={1}
                          max={20}
                          step={1}
                          onValueChange={(value) => setQuestionsPerSession(value[0])}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="shuffle">Embaralhar opções de resposta</Label>
                        <Switch id="shuffle" checked={shuffleOptions} onCheckedChange={setShuffleOptions} />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="explanation">Mostrar explicações</Label>
                        <Switch id="explanation" checked={showExplanation} onCheckedChange={setShowExplanation} />
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button size="lg" onClick={handleStartQuiz} className="gap-2">
                        <Play className="h-4 w-4" /> Iniciar Quiz com Estas Configurações
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="space-y-6">
                  <DynamicQuiz
                    mode={mode}
                    questionsPerSession={questionsPerSession}
                    shuffleOptions={shuffleOptions}
                    showExplanation={showExplanation}
                    onComplete={(score, total) => {
                      console.log(`Quiz completo! Pontuação: ${score}/${total}`)
                    }}
                  />

                  <div className="flex justify-center mt-4">
                    <Button variant="outline" onClick={handleResetQuiz} className="gap-2">
                      <Settings className="h-4 w-4" /> Alterar Configurações
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


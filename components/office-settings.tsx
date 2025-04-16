"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Bell, Shield, Database, Save } from "lucide-react"

export default function OfficeSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [taskReminders, setTaskReminders] = useState(true)
  const [storageSync, setStorageSync] = useState(true)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
          <p className="text-gray-500">Gerencie as configurações do sistema e preferências do usuário.</p>
        </div>
      </div>

      <Tabs defaultValue="notifications">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="integration">
            <Database className="h-4 w-4 mr-2" />
            Integrações
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="account">
            <Settings className="h-4 w-4 mr-2" />
            Conta
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications" className="text-base">
                      Notificações por E-mail
                    </Label>
                    <p className="text-sm text-gray-500">Receba notificações sobre tarefas e atualizações por e-mail</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="task-reminders" className="text-base">
                      Lembretes de Tarefas
                    </Label>
                    <p className="text-sm text-gray-500">Receba lembretes sobre tarefas próximas do vencimento</p>
                  </div>
                  <Switch id="task-reminders" checked={taskReminders} onCheckedChange={setTaskReminders} />
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="notification-email">E-mail para Notificações</Label>
                <Input id="notification-email" placeholder="seu.email@escritorio.com" />
              </div>

              <Button>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Integração</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="storage-sync" className="text-base">
                      Sincronização com Supabase Storage
                    </Label>
                    <p className="text-sm text-gray-500">Sincronize automaticamente documentos com o Supabase Storage</p>
                  </div>
                  <Switch id="storage-sync" checked={storageSync} onCheckedChange={setStorageSync} />
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="storage-url">URL do Supabase Storage</Label>
                <Input
                  id="storage-url"
                  value="https://project-ref.supabase.co/storage/v1/object/public/supplier-documents"
                  readOnly
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="excel-file">Arquivo Excel para Sincronização de Tarefas</Label>
                <Input id="excel-file" value="EYx2EodNt1JNjGJzmczoVEoB6oM2_canXzVGb-Eb8roOeg" readOnly />
              </div>

              <Button>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Segurança</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 py-8 text-center">
                As configurações de segurança são gerenciadas pelo administrador do sistema.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Conta</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 py-8 text-center">
                As configurações da conta são gerenciadas pelo administrador do sistema.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

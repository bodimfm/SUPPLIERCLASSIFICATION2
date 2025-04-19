import { NextResponse } from "next/server"
import { supabaseAdmin, isAdminClientConfigured } from "../supabase-config"
import { supabase } from "@/lib/supabase-client"

export async function GET() {
  try {
    const results = {
      success: true,
      message: "Diagnóstico de conexão com Supabase",
      clientStatus: {
        regularClient: false,
        adminClient: false
      },
      environmentVariables: {
        url: false,
        anonKey: false,
        serviceKey: false
      },
      connection: {
        regularClient: false,
        adminClient: false
      },
      buckets: {
        listAccess: false,
        createAccess: false,
        supplierDocumentsBucket: "não verificado"
      },
      database: {
        supplierTable: "não verificado",
        assessmentTable: "não verificado",
        documentsTable: "não verificado"
      },
      rls: {
        enabled: "não verificado",
        policies: "não verificado"
      }
    }

    // 1. Verificar as variáveis de ambiente
    results.environmentVariables = {
      url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    }

    // 2. Verificar se os clientes estão configurados
    results.clientStatus.regularClient = !!supabase
    results.clientStatus.adminClient = isAdminClientConfigured()
    
    if (!results.clientStatus.regularClient) {
      return NextResponse.json(
        {
          ...results,
          success: false,
          message: "Cliente Supabase regular não está configurado corretamente"
        },
        { status: 500 }
      )
    }

    // 3. Testar conexão com cliente regular
    try {
      const { data: regularData, error: regularError } = await supabase.from("suppliers").select("count").limit(1)
      
      results.connection.regularClient = !regularError
      if (regularError) {
        console.error("Erro ao conectar com cliente regular:", regularError)
      }
    } catch (error) {
      console.error("Erro ao testar cliente regular:", error)
      results.connection.regularClient = false
    }

    // 4. Testar conexão com cliente admin
    if (results.clientStatus.adminClient) {
      try {
        const { data: adminData, error: adminError } = await supabaseAdmin.from("suppliers").select("count").limit(1)
        
        results.connection.adminClient = !adminError
        if (adminError) {
          console.error("Erro ao conectar com cliente admin:", adminError)
        } else {
          // Armazenar dados da tabela suppliers
          results.database.supplierTable = adminData?.length > 0 ? "acessível" : "vazia ou inacessível"
        }
      } catch (error) {
        console.error("Erro ao testar cliente admin:", error)
        results.connection.adminClient = false
      }

      // 5. Verificar acesso aos buckets
      try {
        const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()

        results.buckets.listAccess = !bucketsError
        if (bucketsError) {
          console.error("Erro ao listar buckets:", bucketsError)
        } else {
          const supplierDocumentsBucket = buckets?.find((bucket) => bucket.name === "supplier-documents")
          results.buckets.supplierDocumentsBucket = supplierDocumentsBucket ? "existe" : "não existe"

          // Se o bucket não existir, tente criá-lo
          if (!supplierDocumentsBucket) {
            try {
              const { data: newBucket, error: createError } = await supabaseAdmin.storage.createBucket("supplier-documents", {
                public: true,
                fileSizeLimit: 10485760, // 10MB
              })

              results.buckets.createAccess = !createError
              if (createError) {
                console.error("Erro ao criar bucket:", createError)
              } else {
                results.buckets.supplierDocumentsBucket = "criado com sucesso"
              }
            } catch (error) {
              console.error("Erro ao criar bucket:", error)
              results.buckets.createAccess = false
            }
          } else {
            results.buckets.createAccess = true // Assumimos que tem acesso se o bucket já existe
          }
        }
      } catch (error) {
        console.error("Erro ao interagir com buckets:", error)
        results.buckets.listAccess = false
      }
    }

    // 6. Verificar tabelas adicionais
    if (results.connection.adminClient) {
      try {
        // Verificar tabela assessments
        const { data: assessmentsData, error: assessmentsError } = await supabaseAdmin
          .from("assessments")
          .select("count")
          .limit(1)

        results.database.assessmentTable = assessmentsError ? 
          (assessmentsError.code === "42P01" ? "não existe" : "erro de acesso") : 
          "acessível"

        // Verificar tabela documents
        const { data: documentsData, error: documentsError } = await supabaseAdmin
          .from("documents")
          .select("count")
          .limit(1)

        results.database.documentsTable = documentsError ? 
          (documentsError.code === "42P01" ? "não existe" : "erro de acesso") : 
          "acessível"

        // Verificar RLS
        try {
          const { data: rlsData, error: rlsError } = await supabaseAdmin.rpc('execute_sql', { 
            sql_query: "SELECT relname, relrowsecurity FROM pg_class WHERE relname IN ('suppliers', 'assessments', 'documents') AND relkind = 'r';" 
          })

          if (!rlsError && rlsData) {
            const tables = Array.isArray(rlsData) ? rlsData : []
            
            const rlsStatus = tables.reduce((acc, table) => {
              const tableName = table[0]
              const hasRls = table[1]
              acc[tableName] = hasRls ? "ativado" : "desativado"
              return acc
            }, {})

            results.rls.enabled = rlsStatus
          }
        } catch (rlsError) {
          console.error("Erro ao verificar RLS:", rlsError)
          results.rls.enabled = "erro ao verificar"
        }

        // Verificar políticas de RLS
        try {
          const { data: policiesData, error: policiesError } = await supabaseAdmin.rpc('execute_sql', { 
            sql_query: "SELECT schemaname, tablename, policyname, permissive FROM pg_policies WHERE schemaname = 'public';" 
          })

          if (!policiesError && policiesData) {
            const policies = Array.isArray(policiesData) ? policiesData : []
            
            const policiesByTable = policies.reduce((acc, policy) => {
              const tableName = policy[1]
              if (!acc[tableName]) {
                acc[tableName] = []
              }
              acc[tableName].push(policy[2]) // nome da política
              return acc
            }, {})

            results.rls.policies = policiesByTable
          }
        } catch (policiesError) {
          console.error("Erro ao verificar políticas de RLS:", policiesError)
          results.rls.policies = "erro ao verificar"
        }

      } catch (error) {
        console.error("Erro ao verificar tabelas adicionais:", error)
      }
    }

    // 7. Finalizar diagnóstico
    const allConnectionsOk = results.connection.regularClient && 
      (results.clientStatus.adminClient ? results.connection.adminClient : true)

    const storageOk = results.clientStatus.adminClient ? 
      (results.buckets.listAccess && results.buckets.supplierDocumentsBucket !== "não existe" && results.buckets.supplierDocumentsBucket !== "não verificado") : 
      true

    results.success = allConnectionsOk && storageOk
    results.message = results.success ? 
      "Conexão com Supabase estabelecida com sucesso" : 
      "Problemas detectados na conexão com Supabase"

    // Adicionar recomendações
    const recommendations = []
    
    if (!results.environmentVariables.url || !results.environmentVariables.anonKey) {
      recommendations.push("Configure as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY")
    }
    
    if (!results.environmentVariables.serviceKey) {
      recommendations.push("Configure a variável de ambiente SUPABASE_SERVICE_ROLE_KEY para operações administrativas")
    }
    
    if (!results.connection.regularClient) {
      recommendations.push("Verifique a configuração do cliente Supabase regular")
    }
    
    if (results.clientStatus.adminClient && !results.connection.adminClient) {
      recommendations.push("Verifique a configuração do cliente Supabase admin e se a chave de serviço está correta")
    }
    
    if (results.buckets.supplierDocumentsBucket === "não existe") {
      recommendations.push("Crie o bucket 'supplier-documents' no Supabase Storage")
    }
    
    if (results.database.assessmentTable === "não existe") {
      recommendations.push("Crie a tabela 'assessments' usando a API /api/create-assessments-table")
    }
    
    if (results.database.documentsTable === "não existe") {
      recommendations.push("Crie a tabela 'documents' usando a API /api/create-documents-table")
    }

    if (recommendations.length > 0) {
      results.recommendations = recommendations
    }

    return NextResponse.json(results, { status: results.success ? 200 : 500 })
  } catch (error: any) {
    console.error("Erro inesperado ao testar conexão:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro inesperado ao testar conexão com Supabase",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

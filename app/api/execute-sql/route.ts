import { NextResponse } from "next/server"
import { supabaseAdmin } from "../supabase-config"

export async function POST(request: Request) {
  try {
    const { sql } = await request.json()

    if (!sql) {
      return NextResponse.json(
        {
          success: false,
          message: "SQL query is required",
        },
        { status: 400 },
      )
    }

    // Executar o SQL diretamente usando o método sql
    try {
      const { data, error } = await supabaseAdmin.sql(sql)

      if (error) {
        return NextResponse.json(
          {
            success: false,
            message: "Erro ao executar SQL",
            error: error,
          },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        message: "SQL executado com sucesso",
        data: data,
      })
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          message: "Erro ao executar SQL",
          error: error.message,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Erro inesperado:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro inesperado",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

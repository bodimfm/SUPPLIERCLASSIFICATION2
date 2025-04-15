import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/database"

export async function GET() {
  try {
    const db = getDatabase()
    const suppliers = await db.listSuppliers()
    return NextResponse.json({ suppliers })
  } catch (error) {
    console.error("Error fetching suppliers:", error)
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const db = getDatabase()
    const id = await db.saveSupplier(data)
    return NextResponse.json({ id, success: true })
  } catch (error) {
    console.error("Error saving supplier:", error)
    return NextResponse.json({ error: "Failed to save supplier" }, { status: 500 })
  }
}

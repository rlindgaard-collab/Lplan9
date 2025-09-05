import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'Ingen fil uploadet' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Læs PDF indhold (simpel tekst ekstraktion)
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    
    // For demonstration - i virkeligheden ville du bruge en PDF parser
    // Her simulerer vi bare en opsummering baseret på filnavn og størrelse
    const fileName = file.name
    const fileSize = file.size
    
    const summary = `Opsummering af ${fileName}:

Dette er en læreplan der indeholder pædagogiske mål og aktiviteter. 
Dokumentet er ${Math.round(fileSize / 1024)} KB stort.

Hovedpunkter:
- Kompetencemål for praktikperioden
- Vidensmål der skal opnås
- Færdighedsmål for den studerende
- Pædagogiske aktiviteter og metoder
- Evaluering og dokumentation

Dokumentet fokuserer på at udvikle den studerendes faglige kompetencer 
gennem praktisk erfaring og teoretisk viden.`

    return new Response(
      JSON.stringify({ summary }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Fejl i pdfsummary:', error)
    return new Response(
      JSON.stringify({ error: 'Fejl ved behandling af PDF' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
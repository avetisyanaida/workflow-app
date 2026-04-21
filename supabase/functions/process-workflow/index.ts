import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ""
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ""
    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    const supabase = createClient(supabaseUrl, supabaseKey)

    const body = await req.json()
    const url = new URL(req.url)
    const workflowId = url.searchParams.get('id') || body.workflowId

    if (!workflowId) throw new Error("Workflow ID is required")

    // 1. Վերցնում ենք թարմացված Workflow-ն Canvas-ից
    const { data: wf, error: wfError } = await supabase
        .from('workflows')
        .select('flow_data')
        .eq('id', workflowId)
        .single()

    if (wfError || !wf) throw new Error("Workflow not found in DB")

    const nodes = wf.flow_data.nodes
    let context = ""
    const payload = body.message || body.payload || JSON.stringify(body)
    // Եթե body-ում email չկա, օգտագործում ենք քոնը թեստի համար
    const targetEmail = body.email || "aida.avetisyan93@gmail.com"

    console.log(`Processing workflow ${workflowId} with ${nodes.length} nodes`)

    // 2. Պրոցեսինգի շղթան
    for (const node of nodes) {
      // Ստանում ենք նոդի տիպը ավելի ճշգրիտ
      const nodeLabel = (node.data.label || "").toLowerCase()
      const nodeDataId = (node.data.id || "").toLowerCase()
      const isTrigger = node.type === 'trigger' || node.data.type === 'trigger'

      console.log(`Executing node: ${nodeLabel || nodeDataId}`)

      // --- TRIGGER: WEBHOOK (Միայն եթե trigger է) ---
      if (nodeDataId.includes("webhook") || (nodeLabel.includes("webhook") && isTrigger)) {
        context = typeof payload === 'string' ? payload : JSON.stringify(payload)
      }

      // --- ACTION: AI AGENT (GROQ/LLAMA) ---
      else if (nodeLabel.includes("gpt") || nodeLabel.includes("llama") || node.data.prompt) {
        const userPrompt = node.data.prompt || "Process this information"

        const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: "You are a professional AI Assistant. Respond in the same language as the user." },
              { role: "user", content: `Context: ${context}\n\nTask: ${userPrompt}` }
            ]
          })
        })

        const aiData = await aiResponse.json()
        context = aiData.choices?.[0]?.message?.content || "AI Error"
        console.log("AI processed the context successfully")
      }

          // --- ACTION: SEND EMAIL (RESEND) ---
      // Ստուգում ենք, որ սա հենց SEND գործողությունն է, ոչ թե Trigger
      else if (nodeLabel.includes("send email") || (nodeLabel.includes("email") && !isTrigger)) {
        if (!resendApiKey) {
          console.error("Resend API Key is missing")
          continue
        }

        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: "onboarding@resend.dev",
            to: targetEmail,
            subject: "Ավտոմատ պատասխան AI-ից",
            html: `
              <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
                <h2 style="color: #333;">AI Պատասխան</h2>
                <p>${context.replace(/\n/g, '<br>')}</p>
              </div>
            `
          })
        })

        if (emailRes.ok) {
          console.log(`Email sent successfully to ${targetEmail}`)
        } else {
          const err = await emailRes.text()
          console.error("Resend API error:", err)
        }
      }
    }

    // 3. Լոգավորում Analytics-ի համար
    await supabase.from('workflow_logs').insert({
      workflow_id: workflowId,
      input_data: payload,
      output_data: context,
      status: 'Success'
    })

    return new Response(JSON.stringify({ success: true, finalContext: context }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error("Critical Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
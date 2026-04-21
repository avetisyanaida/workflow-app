"use client"

import { X, Plus, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PropertiesPanelProps {
  selectedNodeId: string | null
  onClose: () => void
}

const nodeProperties: Record<string, { title: string; type: string }> = {
  "email-trigger": { title: "EMAIL TRIGGER", type: "Trigger" },
  "sentiment-analysis": { title: "SENTIMENT ANALYSIS", type: "AI Agent" },
  "auto-reply": { title: "AUTO-REPLY", type: "AI Agent" },
  "archive-email": { title: "ARCHIVE EMAIL", type: "Action" },
  "prioritize": { title: "PRIORITIZE", type: "AI Agent" },
  "create-ticket": { title: "CREATE TICKET", type: "Action" },
  "slack-notification": { title: "SLACK NOTIFICATION", type: "Action" },
}

export function PropertiesPanel({ selectedNodeId, onClose }: PropertiesPanelProps) {
  const node = selectedNodeId ? nodeProperties[selectedNodeId] : null

  if (!node) {
    return (
      <div className="w-80 bg-card border-l border-border p-6">
        <div className="text-center text-muted-foreground py-12">
          <p className="text-sm">Select a node to view its properties</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground tracking-wider">
          NODE PROPERTIES
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Node Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Bot className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{node.title}</h4>
          </div>
        </div>

        {/* Source Variable */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Source Variable
          </label>
          <select className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground">
            <option>email_body</option>
            <option>email_subject</option>
            <option>sender_email</option>
          </select>
        </div>

        {/* AI Model */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            AI Model
          </label>
          <select className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground">
            <option>gpt-4-turbo</option>
            <option>gpt-4</option>
            <option>gpt-3.5-turbo</option>
            <option>claude-3-opus</option>
          </select>
        </div>

        {/* Prompt Template */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Prompt Template
          </label>
          <textarea
            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground resize-none h-24"
            placeholder="Prompt ?empt to test your email_body."
            defaultValue="Prompt ?empt to test your email_body."
          />
        </div>

        {/* Add Event Button */}
        <Button variant="outline" className="w-full gap-2">
          <Plus className="w-4 h-4" />
          Add evermore
        </Button>
      </div>
    </div>
  )
}

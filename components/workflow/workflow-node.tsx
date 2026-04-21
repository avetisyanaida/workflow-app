"use client"

import { cn } from "@/lib/utils"
import { Bot, Mail, Archive, Ticket, MessageSquare, AlertTriangle } from "lucide-react"
import React from "react";

interface WorkflowNodeProps {
  id: string
  name: string
  subtitle: string
  status?: string
  icon: string
  isSelected?: boolean
  onClick?: () => void
  className?: string
}

const iconMap: Record<string, React.ElementType> = {
  gmail: Mail,
  ai: Bot,
  archive: Archive,
  jira: Ticket,
  slack: MessageSquare,
  prioritize: AlertTriangle,
}

const iconColors: Record<string, string> = {
  gmail: "bg-red-100 text-red-600",
  ai: "bg-emerald-100 text-emerald-600",
  archive: "bg-blue-100 text-blue-600",
  jira: "bg-blue-100 text-blue-600",
  slack: "bg-purple-100 text-purple-600",
  prioritize: "bg-emerald-100 text-emerald-600",
}

export function WorkflowNode({
                               name,
                               subtitle,
                               status,
                               icon,
                               isSelected,
                               onClick,
                               className,
                             }: WorkflowNodeProps) {
  const Icon = iconMap[icon] || Bot

  return (
      <div
          onClick={onClick}
          className={cn(
              "flex items-center gap-3 bg-card border-2 rounded-xl px-4 py-3 shadow-sm cursor-pointer transition-all duration-500 min-w-[200px]",
              status === "Processing" ? "border-blue-500 shadow-md shadow-blue-100 scale-105" :
                  status === "Completed" ? "border-emerald-500 shadow-md shadow-emerald-50" :
                      isSelected ? "border-emerald-500 shadow-emerald-100" : "border-border",
              className
          )}
      >
        <div
            className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-500",
                status === "Processing" ? "bg-blue-500 text-white animate-pulse" :
                    status === "Completed" ? "bg-emerald-500 text-white" :
                        iconColors[icon] || "bg-muted text-muted-foreground"
            )}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm text-foreground">{name}</span>
          <span className="text-xs text-muted-foreground">{subtitle}</span>

          {status && (
              <div className="flex items-center gap-1.5 mt-1">
                {status === "Processing" && (
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                )}
                <span className={cn(
                    "text-[10px] font-bold uppercase",
                    status === "Processing" ? "text-blue-500" :
                        status === "Completed" ? "text-emerald-500" : "text-muted-foreground"
                )}>
               {status}
             </span>
              </div>
          )}
        </div>
      </div>
  )
}

interface ConnectionLabelProps {
  label: string
  variant: "positive" | "negative"
}

export function ConnectionLabel({ label, variant }: ConnectionLabelProps) {
  return (
    <span
      className={cn(
        "px-2 py-1 rounded text-xs font-medium",
        variant === "positive"
          ? "bg-emerald-500 text-white"
          : "bg-muted text-muted-foreground"
      )}
    >
      {label}
    </span>
  )
}

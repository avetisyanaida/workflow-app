"use client"

import React, { useState } from "react"
import {
  LayoutGrid,
  Database,
  Bot,
  BarChart3,
  Settings,
  Mail,
  FileText,
  Calendar,
  Download,
  Send,
  FileCode,
  Search,
  Grid3X3,
  Sparkles,
  Cpu,
  ChevronRight,
  ChevronDown,
  Link,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { icon: LayoutGrid, label: "Canvas" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Database, label: "Data" },
  { icon: Bot, label: "Agents" },
  { icon: Settings, label: "Settings" },
]

const triggers = [
  { icon: Mail, label: "Email", id: "gmail" },
  { icon: Link, label: "Webhook", id: "webhook" },
  { icon: FileText, label: "Form", id: "form" },
  { icon: Calendar, label: "Schedule", id: "schedule" },
]

const actions = [
  { icon: Download, label: "Get Data", id: "get-data" },
  { icon: Send, label: "Send Email", id: "send-email" },
  { icon: FileCode, label: "Log", id: "log" },
]

const aiAgents = [
  { icon: Search, label: "Analyze Sentiment", id: "sentiment" },
  { icon: Grid3X3, label: "Categorize", id: "categorize" },
  { icon: Sparkles, label: "GPT-4", id: "gpt4" },
  { icon: Cpu, label: "Llama 3", id: "llama3" },
]

interface SidebarItemProps {
  icon: React.ElementType
  label: string
  type: string
  nodeData: any
}

function SidebarItem({ icon: Icon, label, type, nodeData }: SidebarItemProps) {
  const onDragStart = (event: React.DragEvent, nodeType: string, data: any) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('nodeData', JSON.stringify(data));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
      <div
          className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted cursor-grab group transition-colors active:cursor-grabbing"
          draggable
          onDragStart={(e) => onDragStart(e, type, nodeData)}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground">{label}</span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
  )
}

function SidebarSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
      <div className="mb-4">
        <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-full px-3 py-2 text-[10px] font-bold text-muted-foreground tracking-wider hover:text-foreground transition-colors uppercase"
        >
          {title}
          <ChevronDown className={cn("w-3 h-3 transition-transform", !isOpen && "-rotate-90")} />
        </button>
        {isOpen && <div className="mt-1 space-y-0.5">{children}</div>}
      </div>
  )
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
      <div className="flex h-full border-r border-border select-none">
        <div className="w-16 bg-card border-r border-border flex flex-col items-center py-4 shrink-0">
          <div className="mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
                <button
                    key={item.label}
                    title={item.label}
                    onClick={() => onTabChange(item.label)} // Սեղմելիս փոխում է tab-ը
                    className={cn(
                        "w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all",
                        activeTab === item.label
                            ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-[9px] font-medium">{item.label}</span>
                </button>
            ))}
          </nav>

          <div className="mt-auto flex flex-col items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold border-2 border-background shadow-sm shadow-indigo-200">
              A
            </div>
          </div>
        </div>

        <div className={cn(
            "w-64 bg-card p-4 overflow-y-auto custom-scrollbar shrink-0 transition-opacity",
            activeTab !== "Canvas" && "opacity-50 pointer-events-none" // Analytics-ի ժամանակ սա դառնում է պասիվ
        )}>
          <h2 className="text-lg font-bold text-foreground mb-6 pl-3 tracking-tight">Aida Flow</h2>

          <SidebarSection title="Workflow Nodes">
            <div className="text-[9px] font-extrabold text-primary/70 tracking-[0.15em] px-3 py-2 mt-2 uppercase">
              Triggers
            </div>
            {triggers.map((item) => (
                <SidebarItem
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    type="workflow"
                    nodeData={{ name: item.label.toUpperCase(), subtitle: '(Trigger)', icon: item.id }}
                />
            ))}

            <div className="text-[9px] font-extrabold text-primary/70 tracking-[0.15em] px-3 py-2 mt-4 uppercase">
              Actions
            </div>
            {actions.map((item) => (
                <SidebarItem
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    type="workflow"
                    nodeData={{ name: item.label.toUpperCase(), subtitle: '(Action)', icon: item.id }}
                />
            ))}

            <div className="text-[9px] font-extrabold text-primary/70 tracking-[0.15em] px-3 py-2 mt-4 uppercase">
              AI Agents
            </div>
            {aiAgents.map((item) => (
                <SidebarItem
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    type="workflow"
                    nodeData={{ name: item.label.toUpperCase(), subtitle: '(AI Agent)', icon: item.id }}
                />
            ))}
          </SidebarSection>

          <SidebarSection title="Canvas Settings">
            <div className="px-3 py-2 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase mb-2 block tracking-tighter">Environment</label>
                <select className="w-full px-2 py-1.5 bg-muted border border-border rounded-md text-xs focus:ring-1 focus:ring-primary outline-none cursor-pointer appearance-none transition-all hover:bg-muted/80">
                  <option>Production</option>
                  <option>Development</option>
                </select>
              </div>
            </div>
          </SidebarSection>
        </div>
      </div>
  )
}
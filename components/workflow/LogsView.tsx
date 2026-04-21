"use client"

import React, { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Clock, CheckCircle2, AlertCircle, Database } from "lucide-react"

interface Log {
    id: string
    created_at: string
    input_data: string
    output_data: string
    status: string
}

export function LogsView({ workflowId }: { workflowId: string | null }) {
    const [logs, setLogs] = useState<Log[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchLogs() {
            if (!workflowId) return
            setLoading(true)

            const { data, error } = await supabase
                .from('workflow_logs')
                .select('*')
                .eq('workflow_id', workflowId)
                .order('created_at', { ascending: false })

            if (!error && data) {
                setLogs(data)
            }
            setLoading(false)
        }

        fetchLogs()
    }, [workflowId])

    if (!workflowId) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                <Database className="w-12 h-12 opacity-20" />
                <p>Save and run your workflow to see execution logs.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-background p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Execution History</h2>
                <p className="text-muted-foreground text-sm">Monitor how your AI agents are processing data.</p>
            </div>

            <div className="flex-1 overflow-auto border rounded-xl bg-card shadow-sm custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="border-b bg-muted/50">
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Timestamp</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Input Source</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">AI Response</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                    {loading ? (
                        <tr><td colSpan={4} className="p-8 text-center text-muted-foreground align-top">Loading logs...</td></tr>
                    ) : logs.length === 0 ? (
                        <tr><td colSpan={4} className="p-8 text-center text-muted-foreground align-top">No executions yet.</td></tr>
                    ) : (
                        logs.map((log) => (
                            <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                                <td className="p-4 whitespace-nowrap align-top text-muted-foreground flex items-center gap-2">
                                    <Clock className="w-3 h-3" />
                                    {new Date(log.created_at).toLocaleString()}
                                </td>
                                <td className="p-4 font-mono text-[11px] max-w-[150px] truncate align-top whitespace-nowrap">
                                    {log.input_data}
                                </td>
                                <td className="p-4 max-w-[300px] align-top">
                                    <div className="bg-slate-900 text-slate-200 p-2 rounded text-[11px] leading-relaxed break-words font-mono">
                                        {log.output_data}
                                    </div>
                                </td>
                                <td className="p-4 align-top">
                                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] uppercase">
                                        <CheckCircle2 className="w-3 h-3" />
                                        {log.status}
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
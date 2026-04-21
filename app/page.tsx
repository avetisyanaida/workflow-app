"use client"

import { useState } from "react"
import { Sidebar } from "@/components/workflow/sidebar"
import { WorkflowCanvas } from "@/components/workflow/workflow-canvas"
import { LogsView } from "@/components/workflow/LogsView"
import AuthComponent from "@/components/AuthComponent";

export default function WorkflowBuilder() {
    const [activeTab, setActiveTab] = useState("Canvas")
    const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null)

    return (
        <AuthComponent>
            <div className="h-screen flex bg-background">
                <Sidebar
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                <main className="flex-1 relative h-full">
                    {activeTab === "Canvas" ? (
                        <WorkflowCanvas
                            workflowId={currentWorkflowId}
                            onWorkflowIdChange={setCurrentWorkflowId}
                        />
                    ) : (
                        <LogsView workflowId={currentWorkflowId} />
                    )}
                </main>
            </div>
        </AuthComponent>
    )
}
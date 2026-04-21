"use client"

import React, { useState, useCallback, useRef, useEffect, useMemo } from "react"
import ReactFlow, {
    Background,
    Controls,
    Connection,
    Edge,
    addEdge,
    Node,
    useNodesState,
    useEdgesState,
    ReactFlowInstance
} from "reactflow"
import "reactflow/dist/style.css"

import { Play, X, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CustomNode } from "./CustomNode"
import { supabase } from "@/lib/supabase"

const nodeTypes = {
    workflow: CustomNode,
};

interface WorkflowCanvasProps {
    workflowId: string | null;
    onWorkflowIdChange: (id: string) => void;
}

export function WorkflowCanvas({ workflowId, onWorkflowIdChange }: WorkflowCanvasProps) {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [copied, setCopied] = useState(false);

    const PROJECT_ID = "owkokweqcmnpvnnbtdss";

    const webhookUrl = useMemo(() => {
        return `https://${PROJECT_ID}.supabase.co/functions/v1/process-workflow?id=${workflowId}`;
    }, [workflowId]);

    // Բեռնում ենք միայն ընթացիկ օգտատիրոջ Workflow-ները
    useEffect(() => {
        const fetchWorkflow = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('workflows')
                .select('id, flow_data')
                .eq('user_id', user.id) // Ստուգում ենք օգտատիրոջ ID-ն
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) {
                console.error("Error fetching flow:", error.message);
                return;
            }

            if (data) {
                onWorkflowIdChange(data.id);
                if (data.flow_data) {
                    const flow = data.flow_data;
                    setNodes(flow.nodes || []);
                    setEdges(flow.edges || []);
                    if (flow.viewport && reactFlowInstance) {
                        const { x, y, zoom } = flow.viewport;
                        reactFlowInstance.setViewport({ x, y, zoom });
                    }
                }
            }
        };

        if (reactFlowInstance) {
            fetchWorkflow();
        }
    }, [setNodes, setEdges, reactFlowInstance, onWorkflowIdChange]);

    const onSave = async () => {
        if (!reactFlowInstance) return;

        // Ստանում ենք ներկա օգտատիրոջը
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert("You must be logged in to save!");
            return;
        }

        const flow = reactFlowInstance.toObject();

        const workflowData: any = {
            user_id: user.id, // Կապում ենք օգտատիրոջ հետ
            name: "AI Automation Workflow",
            flow_data: flow,
            status: "Ready"
        };

        if (workflowId) {
            workflowData.id = workflowId;
        }

        const { data, error } = await supabase
            .from('workflows')
            .upsert(workflowData)
            .select()
            .single();

        if (error) {
            console.error("Error saving:", error.message);
            alert("Save failed: " + error.message);
        } else if (data) {
            onWorkflowIdChange(data.id);
            if (selectedNode) {
                setSelectedNode((prev) => prev ? { ...prev } : null);
            }
            alert("Workflow saved successfully!");
        }
    };

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(webhookUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const runWorkflow = useCallback(async () => {
        if (!workflowId) {
            alert("Please save your workflow first!");
            return;
        }

        setNodes((nds) =>
            nds.map((node) => ({
                ...node,
                data: { ...node.data, status: "Processing" },
            }))
        );

        try {
            const { data, error } = await supabase.functions.invoke('process-workflow', {
                body: { nodes, edges, workflowId }
            });

            if (error) throw error;
            if (data.nodes) setNodes(data.nodes);

        } catch (err) {
            console.error("Execution error:", err);
            setNodes((nds) =>
                nds.map((node) => ({
                    ...node,
                    data: { ...node.data, status: "Ready" },
                }))
            );
        }
    }, [nodes, edges, setNodes, workflowId]);

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        if (!reactFlowWrapper.current || !reactFlowInstance) return;

        const type = event.dataTransfer.getData('application/reactflow');
        const rawData = event.dataTransfer.getData('nodeData');

        if (!type || !rawData) return;

        const nodeData = JSON.parse(rawData);
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const position = reactFlowInstance.project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
        });

        const newNode: Node = {
            id: `node_${Date.now()}`,
            type,
            position,
            data: {
                ...nodeData,
                status: "Ready",
                prompt: nodeData.subtitle?.toLowerCase().includes('ai') ? "Analyze this input..." : undefined,
                id: (nodeData.name || nodeData.icon || "").toLowerCase()
            },
        };

        setNodes((nds) => nds.concat(newNode));
    }, [reactFlowInstance, setNodes]);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
        [setEdges]
    );

    const updateNodeData = (newData: any) => {
        if (!selectedNode) return;
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === selectedNode.id) {
                    const updatedNode = { ...node, data: { ...node.data, ...newData } };
                    setSelectedNode(updatedNode);
                    return updatedNode;
                }
                return node;
            })
        );
    };

    return (
        <div className="flex flex-1 h-full overflow-hidden">
            <div className="flex-1 flex flex-col relative" ref={reactFlowWrapper}>
                <div className="h-16 bg-card border-b flex items-center justify-between px-6 z-10">
                    <h1 className="text-xl font-semibold">Workflow Automation</h1>
                    <div className="flex items-center gap-3">
                        <Button className="bg-primary gap-2" onClick={runWorkflow}>
                            <Play className="w-4 h-4" /> RUN
                        </Button>
                        <Button variant="outline" className="bg-emerald-500 hover:bg-emerald-600 text-white border-none" onClick={onSave}>
                            SAVE
                        </Button>
                    </div>
                </div>

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onInit={setReactFlowInstance}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onNodeClick={(e, node) => setSelectedNode(node)}
                    onPaneClick={() => setSelectedNode(null)}
                    nodeTypes={nodeTypes}
                    deleteKeyCode={["Backspace", "Delete"]}
                    fitView
                >
                    <Background color="#999" gap={20} />
                    <Controls />
                </ReactFlow>
            </div>

            {selectedNode && (
                <div className="w-80 bg-card border-l p-6 overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-bold uppercase text-muted-foreground">Node Properties</h2>
                        <button onClick={() => setSelectedNode(null)} className="p-1 hover:bg-muted rounded">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {String(selectedNode.data.id || "").toLowerCase().includes('webhook') && (
                            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
                                <label className="text-[10px] font-bold text-primary uppercase block">Webhook Endpoint</label>
                                <div className="p-2 bg-background border rounded text-[10px] font-mono break-all text-muted-foreground">
                                    {workflowId ? webhookUrl : "Save to generate URL"}
                                </div>
                                <Button
                                    variant={copied ? "default" : "secondary"}
                                    size="sm"
                                    className="w-full text-xs h-8 gap-2"
                                    disabled={!workflowId}
                                    onClick={handleCopyUrl}
                                >
                                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    {copied ? "Copied!" : "Copy URL"}
                                </Button>
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-2 uppercase">Display Name</label>
                            <input
                                value={selectedNode.data.name || ''}
                                onChange={(e) => updateNodeData({ name: e.target.value })}
                                className="w-full p-2 bg-muted border rounded-md text-sm outline-none"
                            />
                        </div>

                        {selectedNode.data.prompt !== undefined && (
                            <div>
                                <label className="text-xs font-bold text-muted-foreground block mb-2 uppercase">AI Prompt</label>
                                <textarea
                                    rows={5}
                                    value={selectedNode.data.prompt || ''}
                                    onChange={(e) => updateNodeData({ prompt: e.target.value })}
                                    className="w-full p-2 bg-muted border rounded-md text-sm outline-none resize-none"
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
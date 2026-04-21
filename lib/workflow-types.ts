export interface WorkflowNode {
  id: string
  type: 'trigger' | 'action' | 'ai-agent'
  name: string
  subtitle: string
  status?: string
  icon: string
  position: { x: number; y: number }
  connections: string[]
}

export interface NodeConnection {
  from: string
  to: string
  label?: string
  labelPosition?: { x: number; y: number }
}

import { Handle, Position, NodeProps } from 'reactflow';
import { WorkflowNode } from "./workflow-node";
import { cn } from "@/lib/utils";

export function CustomNode({ data, selected }: NodeProps) {
    return (
        <div className="group relative">
            <Handle
                type="target"
                position={Position.Left}
                className={cn(
                    "w-3 h-3 border-2 border-background !bg-muted-foreground transition-colors group-hover:!bg-primary",
                    selected && "!bg-primary !border-primary"
                )}
            />

            {/* Փոխել ենք max-w-[200px]-ը w-[200px]-ի և ավելացրել ենք bg-white/shadow */}
            <div className={cn(
                "transition-all duration-200 w-[200px] shadow-sm bg-white rounded-xl overflow-hidden",
                selected ? "ring-2 ring-primary ring-offset-2" : "border border-slate-200"
            )}>
                <WorkflowNode
                    id={data.id}
                    name={data.name}
                    subtitle={data.subtitle}
                    icon={data.icon}
                    isSelected={selected}
                    status={data.status}
                />

                {data.result && (
                    <div className="bg-slate-900 text-slate-100 text-[10px] border-t border-slate-700">
                        <div className="px-2 py-1 bg-slate-800/50 text-[8px] uppercase font-bold text-slate-400 flex justify-between items-center">
                            <span>AI Response</span>
                        </div>

                        {/* Տեքստի կտրման (break-words) ապահովում */}
                        <div className="p-3 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 break-words leading-relaxed text-left font-mono opacity-90">
                            {data.result}
                        </div>
                    </div>
                )}
            </div>

            <Handle
                type="source"
                position={Position.Right}
                className={cn(
                    "w-3 h-3 border-2 border-background !bg-muted-foreground transition-colors group-hover:!bg-primary",
                    selected && "!bg-primary !border-primary"
                )}
            />
        </div>
    );
}
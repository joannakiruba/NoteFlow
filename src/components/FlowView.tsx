import ReactFlow, { 
  Node, 
  Edge, 
  Background, 
  Controls, 
  MiniMap 
} from 'reactflow';
import 'reactflow/dist/style.css';

interface FlowViewProps {
  nodes: Node[];
  edges: Edge[];
}

export const FlowView = ({ nodes, edges }: FlowViewProps) => {
  return (
    <div className="h-full w-full bg-slate-50 border rounded-lg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
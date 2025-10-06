import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import IconNode from './IconNode';
import type {FC} from 'react';
import type {Node, Edge} from 'reactflow';


const nodeTypes = {
  iconNode: IconNode,
};

interface ReactFlowDiagramProps {
  nodes: Node[];
  edges: Edge[];
}

const ReactFlowDiagram: FC<ReactFlowDiagramProps> = ({ nodes, edges }) =>  {
  return (
    <div style={{ width: '100%', height: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};

export default ReactFlowDiagram;

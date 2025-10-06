import dagre from 'dagre';
import type { Node, Edge } from 'reactflow';
import { keywordToIconMap } from './keywordToIconMap';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

export function parsePromptToFlow(prompt: string): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const used = new Set<string>();
  let idCounter = 1;

  const lowerPrompt = prompt.toLowerCase();

  Object.entries(keywordToIconMap).forEach(([keyword, icon]) => {
    if (lowerPrompt.includes(keyword) && !used.has(keyword)) {
      const nodeId = `node-${idCounter++}`;
      nodes.push({
        id: nodeId,
        data: { label: keyword, icon },
        position: { x: 0, y: 0 }, // Temp, layout will override
        type: 'iconNode',
      });
      used.add(keyword);
    }
  });

  // Dummy edges for layout (connect sequentially)
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push({
      id: `e${nodes[i].id}-${nodes[i + 1].id}`,
      source: nodes[i].id,
      target: nodes[i + 1].id,
      type: 'smoothstep',
    });
  }

  // Setup Dagre layout
  dagreGraph.setGraph({ rankdir: 'TB' }); // top-bottom layout
  nodes.forEach((node) => dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight }));
  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));
  dagre.layout(dagreGraph);

  // Apply new positions
  nodes.forEach((node) => {
    const { x, y } = dagreGraph.node(node.id);
    node.position = { x, y };
  });

  return { nodes, edges };
}

import { Node, Edge, Position } from 'reactflow';
import dagre from 'dagre';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface ParsedData {
  nodes: Node[];
  edges: Edge[];
  flashcards: Flashcard[];
}

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    // Determine dimensions based on content length approx
    // Using a default width/height since we don't have the rendered element dimensions yet
    // Improving heuristic:
    const label = node.data.label || '';
    const width = Math.min(200, Math.max(150, label.length * 8)); 
    const height = Math.max(50, Math.ceil(label.length / 25) * 20 + 40);

    dagreGraph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    // Shift dagre's center-anchor to ReactFlow's top-left anchor
    // ReactFlow nodes handle position as top-left
    // Dagre returns center x,y
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - nodeWithPosition.width / 2,
        y: nodeWithPosition.y - nodeWithPosition.height / 2,
      },
      style: { width: nodeWithPosition.width, height: nodeWithPosition.height, ...node.style }
    };
  });

  return { nodes: layoutedNodes, edges };
};

export const parseMarkdown = (text: string): ParsedData => {
  const lines = text.split('\n');
  const rawNodes: Node[] = [];
  const edges: Edge[] = [];
  const flashcards: Flashcard[] = [];

  // Stack to track the last node at each level to find parents
  // stack[level] = nodeId
  const stack: { [level: number]: string } = {};
  
  let currentHeadingLevel = 0; // Baseline for bullets

  lines.forEach((line, index) => {
    // Determine line type and indentation
    const trimmed = line.trim();
    if (!trimmed) return;

    let level = 0;
    let content = '';
    let isHeading = false;

    if (line.trimStart().startsWith('#')) {
      // Heading
      const match = line.match(/^\s*(#+)\s*(.*)/);
      if (match) {
        const hashes = match[1].length;
        level = hashes - 1; // # is level 0, ## is level 1
        content = match[2].trim();
        isHeading = true;
        
        // Reset heading baseline for subsequent bullets
        currentHeadingLevel = level;
      }
    } else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
      // Bullet
      const match = line.match(/^(\s*)([-*])\s+(.*)/);
      if (match) {
        const indent = match[1].length;
        content = match[3].trim();
        const indentLevel = Math.floor(indent / 2);
        level = currentHeadingLevel + 1 + indentLevel;
      } else {
        content = trimmed.substring(1).trim();
        level = currentHeadingLevel + 1;
      }
    } else {
      return;
    }

    const id = `node-${index}`;
    
    // Add logic to avoid duplicate nodes if needed, but unique IDs per line is safer
    rawNodes.push({
      id,
      type: isHeading ? 'input' : 'default',
      data: { label: content },
      position: { x: 0, y: 0 }, // Position calculated by Dagre later
      style: isHeading ? { fontWeight: 'bold', background: '#f8f9fa' } : {}
    });

    stack[level] = id;
    for (let l = level + 1; l < 20; l++) delete stack[l];

    if (level > 0) {
      let parentId = null;
      for (let l = level - 1; l >= 0; l--) {
        if (stack[l]) {
          parentId = stack[l];
          break;
        }
      }
      if (parentId) {
        edges.push({
          id: `edge-${parentId}-${id}`,
          source: parentId,
          target: id,
          type: 'smoothstep'
        });
      }
    }

    // Flashcard Extraction
    if (content.includes(':')) {
      const parts = content.split(':');
      if (parts.length >= 2) {
        flashcards.push({
          id: `fc-${index}`,
          front: parts[0].trim(),
          back: parts.slice(1).join(':').trim(),
        });
      }
    } else if (content.includes(' - ')) {
       const parts = content.split(' - ');
       if (parts.length >= 2) {
        flashcards.push({
          id: `fc-${index}`,
          front: parts[0].trim(),
          back: parts.slice(1).join(' - ').trim(),
        });
       }
    }
  });

  // Calculate Layout
  // Use TB (Top-Bottom) for standard hierarchy
  const layouted = getLayoutedElements(rawNodes, edges, 'TB');

  return { nodes: layouted.nodes, edges: layouted.edges, flashcards };
};

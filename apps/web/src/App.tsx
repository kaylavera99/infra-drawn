import { useState } from 'react';
import MermaidDiagram from './components/MermaidDiagram';
import ReactFlowDiagram from './components/ReactFlow';
import type { Node, Edge} from 'reactflow'
import { parsePromptToFlow } from './helpers/parsePromptToFlow';


function App() {
  const [inputPrompt, setPrompt] = useState('');
  const [diagram, setDiagram] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [diagramType, setDiagramType] = useState('flowchart TD');
  const [flowNodes, setFlowNodes] = useState<Node[]>([]);
  const [flowEdges, setFlowEdges] = useState<Edge[]>([]);


  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: inputPrompt, diagramType }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch diagram');
      }

      const data = await response.json();
      setDiagram(data.diagram);
      const { nodes, edges } = parsePromptToFlow(inputPrompt);
      setFlowNodes(nodes);
      setFlowEdges(edges);

    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  function decodeHTMLEntities(str: string): string {
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
}


return (
  <div
    style={{
      padding: '2rem',
      fontFamily: 'sans-serif',
      color: 'white',
      backgroundColor: '#555',
      minHeight: '100vh',
    }}
  >
    <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>Infra Drawn</h1>

    <div
      style={{
        display: 'flex',
        gap: '2rem',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        flexDirection: 'row',
      }}
    >
      {/* Left Panel – Inputs */}
      <div style={{ flex: '1 1 400px', minWidth: '300px' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          Diagram Type:
        </label>
        <select
          value={diagramType}
          onChange={(e) => setDiagramType(e.target.value)}
          style={{
            marginBottom: '1rem',
            padding: '0.5rem',
            fontSize: '1rem',
            width: '100%',
          }}
        >
          <option value="flowchart TD">Flowchart</option>
          <option value="sequenceDiagram">Sequence Diagram</option>
          <option value="block">Block Diagram</option>
          <option value="gitGraph">Git Graph</option>
        </select>

        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          Describe your infrastructure:
        </label>
        <textarea
          value={inputPrompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your system or architecture in plain English..."
          rows={6}
          style={{
            width: '100%',
            padding: '0.5rem',
            marginBottom: '1rem',
            fontSize: '1rem',
            fontFamily: 'sans-serif',
            resize: 'vertical',
          }}
        />

        <button
          onClick={handleGenerate}
          disabled={loading || !inputPrompt}
          style={{
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            fontSize: '1rem',
            backgroundColor: '#8e44ad',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          {loading ? 'Generating...' : 'Generate Diagram'}
        </button>

        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          Mermaid Code Output:
        </label>
        <textarea
          value={diagram}
          readOnly
          rows={10}
          style={{
            width: '100%',
            fontFamily: 'monospace',
            backgroundColor: '#333',
            color: '#fff',
            padding: '1rem',
            border: '1px solid #777',
            resize: 'vertical',
            overflow: 'auto',
            whiteSpace: 'pre',
          }}
        />

        {error && (
          <p style={{ color: 'tomato', marginTop: '1rem' }}>
            Error: {error}
          </p>
        )}
      </div>

      {/* Right Panel – Diagram */}
      <div
        style={{
          flex: '2 1 700px',
          backgroundColor: 'white',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #555',
          minHeight: '500px',
          overflow: 'auto',
        }}
      >
        <MermaidDiagram chart={decodeHTMLEntities(diagram)} />
        <div style={{ height: '500px', marginTop: '2rem' }}>
  <ReactFlowDiagram nodes={flowNodes} edges={flowEdges} />
</div>
      </div>
    </div>
  </div>
);

}

export default App;

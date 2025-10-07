import React, {useEffect, useRef} from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
    chart: string;
}

const MermaidDiagram: React.FC<MermaidProps> = ({ chart }) => {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartRef.current) return;

        mermaid.initialize({ startOnLoad: false});

        const renderMermaid = async() => {
            try {
                const {svg} = await mermaid.render('theGraph', chart);
                chartRef.current!.innerHTML = svg;
            } catch (error: any) {
                chartRef.current!.innerHTML = `<pre>${error?.message || error}</pre>`
            }
        };

        renderMermaid();
    }, [chart]);
      

    return <div ref={chartRef} />;
};

export default MermaidDiagram
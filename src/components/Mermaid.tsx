import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    fontFamily: '"Space Grotesk", sans-serif',
    primaryColor: '#0f172a',
    primaryTextColor: '#cffafe',
    primaryBorderColor: '#06b6d4',
    lineColor: '#06b6d4',
    secondaryColor: '#1e293b',
    tertiaryColor: '#020617',
    nodeBorder: '#06b6d4',
    clusterBkg: 'rgba(6, 182, 212, 0.05)',
    clusterBorder: '#0891b2',
  },
  securityLevel: 'loose',
});

interface MermaidProps {
  chart: string;
}

export const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!chart || chart.trim() === '') {
      if (ref.current) ref.current.innerHTML = '';
      return;
    }

    let isMounted = true;

    const renderChart = async () => {
      if (ref.current && chart) {
        try {
          setHasError(false);
          
          // Cleanup common AI hallucinations in Mermaid code
          const cleanChart = chart
            .split('\n')
            .filter(line => {
              const trimmed = line.trim();
              // Remove lines that are just dashes or equals (common AI titles)
              if (/^[-=]{3,}$/.test(trimmed)) return false;
              // Remove lines that look like numbered lists but aren't valid Mermaid nodes
              if (/^\d+\.\s/.test(trimmed) && !trimmed.includes('[') && !trimmed.includes('(') && !trimmed.includes('{')) return false;
              return true;
            })
            .join('\n');

          const id = `mermaid-svg-${Math.random().toString(36).substring(2, 9)}`;
          const { svg } = await mermaid.render(id, cleanChart);
          if (isMounted && ref.current) {
            ref.current.innerHTML = svg;
          }
        } catch (error) {
          console.error('Mermaid rendering failed:', error);
          if (isMounted) {
            setHasError(true);
          }
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (hasError) {
    return (
      <div className="p-4 border border-red-500/50 bg-red-950/30 text-red-400 rounded-md text-sm font-mono overflow-auto glow-border">
        <p className="font-bold mb-2">ERRO DE RENDERIZAÇÃO [SISTEMA MERMAID]:</p>
        <pre>{chart}</pre>
      </div>
    );
  }

  return (
    <div 
      ref={ref} 
      className="flex justify-center my-6 p-6 glass-panel rounded-xl overflow-x-auto"
    />
  );
};

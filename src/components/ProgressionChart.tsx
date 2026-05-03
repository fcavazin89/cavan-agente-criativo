import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { stage: 'Criativos', clienteA: 10, clienteB: 5, clienteC: 2, aprendizado: 'Atenção' },
  { stage: 'Livros', clienteA: 25, clienteB: 15, clienteC: 8, aprendizado: 'Conscientização' },
  { stage: 'Planners', clienteA: 45, clienteB: 30, clienteC: 15, aprendizado: 'Organização' },
  { stage: 'Curso', clienteA: 70, clienteB: 50, clienteC: 25, aprendizado: 'Aprofundamento' },
  { stage: 'Masterclass', clienteA: 85, clienteB: 65, clienteC: 35, aprendizado: 'Estratégia' },
  { stage: 'Mentoria', clienteA: 95, clienteB: 80, clienteC: 45, aprendizado: 'Acompanhamento' },
  { stage: 'Consultoria', clienteA: 100, clienteB: 90, clienteC: 50, aprendizado: 'Delegação' },
];

export function ProgressionChart() {
  return (
    <div className="w-full h-[400px] glass-panel p-6 rounded-xl flex flex-col">
      <div className="mb-6">
        <h3 className="text-cyan-400 font-mono text-lg glow-text tracking-widest uppercase">Análise de Progressão e Aprendizado</h3>
        <p className="text-cyan-600 text-xs font-mono mt-1">Comparativo de Resultados por Perfil de Cliente (Estudos de Caso)</p>
      </div>
      <div className="flex-1 min-h-[300px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorC" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#0891b2" opacity={0.2} />
            <XAxis dataKey="stage" stroke="#06b6d4" fontSize={12} tick={{fill: '#06b6d4'}} />
            <YAxis stroke="#06b6d4" fontSize={12} tick={{fill: '#06b6d4'}} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0b1120', borderColor: '#06b6d4', color: '#cffafe', borderRadius: '8px' }}
              itemStyle={{ color: '#06b6d4', fontFamily: 'JetBrains Mono' }}
              labelStyle={{ color: '#cffafe', fontWeight: 'bold', marginBottom: '4px' }}
              formatter={(value: number, name: string, props: any) => [
                `${value}% (Foco: ${props.payload.aprendizado})`, 
                name
              ]}
            />
            <Legend wrapperStyle={{ color: '#cffafe', fontFamily: 'JetBrains Mono', fontSize: '12px', paddingTop: '10px' }} />
            <Area type="monotone" dataKey="clienteA" name="Cliente A (Acelerado)" stroke="#06b6d4" fillOpacity={1} fill="url(#colorA)" />
            <Area type="monotone" dataKey="clienteB" name="Cliente B (Consistente)" stroke="#3b82f6" fillOpacity={1} fill="url(#colorB)" />
            <Area type="monotone" dataKey="clienteC" name="Cliente C (Iniciante)" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorC)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

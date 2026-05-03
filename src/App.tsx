import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Send, 
  BookOpen, 
  Map, 
  GitGraph, 
  Lightbulb, 
  Wrench, 
  Loader2,
  RefreshCcw,
  Activity,
  Terminal,
  Crosshair,
  Shield,
  Zap,
  Database,
  ChevronRight,
  BarChart3,
  Users
} from 'lucide-react';
import { sendMessageToProfessor, resetChat } from './services/gemini';
import { Mermaid } from './components/Mermaid';
import { ProgressionChart } from './components/ProgressionChart';
import { playSound } from './lib/audio';
import { cn } from './lib/utils';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

type ViewState = 'terminal' | 'analytics';

const QUICK_ACTIONS = [
  {
    id: 'grade',
    icon: <Database className="w-5 h-5" />,
    label: 'Grade Acadêmica',
    prompt: 'Estruture a Grade Acadêmica completa da minha esteira de produtos (dos criativos gratuitos até a consultoria). Divida em ciclos (ex: Básico, Profissionalizante, Especialização) e detalhe o objetivo de cada etapa.'
  },
  {
    id: 'persona',
    icon: <Users className="w-5 h-5" />,
    label: 'Persona & ICP',
    prompt: 'Defina em detalhes a Persona e o ICP (Ideal Customer Profile) ideais para a etapa atual. Descreva suas dores, desejos, comportamentos e como a oferta se alinha às suas necessidades.'
  },
  {
    id: 'funil',
    icon: <GitGraph className="w-5 h-5" />,
    label: 'Mapa do Funil',
    prompt: 'Desenhe o Mapa Mental do Funil de Vendas e Aprendizado. Use a linguagem MERMAID (mindmap ou graph) para ilustrar a jornada do cliente, desde o conteúdo gratuito até a consultoria.'
  },
  {
    id: 'roadmap',
    icon: <Map className="w-5 h-5" />,
    label: 'Gantt & Roadmap',
    prompt: 'Crie um Gráfico de Gantt (usando a sintaxe gantt do MERMAID) detalhando o tempo estimado de implementação para cada produto da esteira. Inclua as evoluções e aprendizados esperados em cada fase.'
  },
  {
    id: 'referencias',
    icon: <BookOpen className="w-5 h-5" />,
    label: 'Embasamento',
    prompt: 'Sugira um embasamento teórico sólido e referências bibliográficas reais (livros, artigos, autores) que fundamentem a criação desta esteira de produtos e a jornada de transformação do cliente.'
  },
  {
    id: 'casos',
    icon: <Crosshair className="w-5 h-5" />,
    label: 'Estudos de Caso',
    prompt: 'Crie um protótipo ou estudo de caso fictício, mas realista, de um cliente que percorreu toda a esteira (dos criativos até a consultoria). Mostre os gatilhos de transição entre cada produto.'
  },
  {
    id: 'ferramentas',
    icon: <Wrench className="w-5 h-5" />,
    label: 'Ferramentas',
    prompt: 'Liste e descreva ferramentas práticas (softwares, plataformas, templates) que podem me ajudar no desenvolvimento e na entrega das tarefas de cada etapa da plataforma.'
  }
];

const FUNNEL_STAGES = [
  { id: 'criativos', label: 'Criativos' },
  { id: 'livros', label: 'Livros' },
  { id: 'planners', label: 'Planners/Agentes' },
  { id: 'curso', label: 'Curso' },
  { id: 'masterclass', label: 'Masterclass' },
  { id: 'mentoria', label: 'Mentoria' },
  { id: 'consultoria', label: 'Consultoria' }
];

export default function App() {
  const [activeView, setActiveView] = useState<ViewState>('terminal');
  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome',
    role: 'assistant',
    content: '> **SISTEMA INICIALIZADO. PROTOCOLO: PROF_AGENT.**\n> \n> Olá. Sou o seu Professor Estrategista operando em modo CAVAN.\n> \n> Estou online e pronto para estruturar sua esteira de produtos como uma **Grade Acadêmica** de alta performance.\n> \n> Nossa jornada vai dos **Criativos** (topo de funil) até a **Consultoria** (high-ticket). Aguardando comandos. Escolha um protocolo ao lado ou digite sua diretriz.'
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (activeView === 'terminal') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeView]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    playSound('beep');
    setActiveView('terminal');

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    playSound('process');

    const assistantMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '' }]);

    try {
      await sendMessageToProfessor(text, (chunk) => {
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId ? { ...msg, content: chunk } : msg
        ));
      });
      playSound('success');
    } catch (error) {
      playSound('error');
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'assistant', 
        content: '> **ERRO DE CONEXÃO:** Falha ao comunicar com o servidor central. Verifique as credenciais de API e tente novamente.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    playSound('beep');
    resetChat();
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: '> **SISTEMA REINICIADO.**\n> \n> Memória limpa. Aguardando novas diretrizes para estruturação.'
    }]);
  };

  const handleStageClick = (stage: typeof FUNNEL_STAGES[0]) => {
    let prompt = `Inicie a estruturação detalhada da etapa: **${stage.label}**.\n\nPor favor, forneça:\n1. Objetivo principal desta fase na esteira.\n2. Sugestões de Preço (Ticket), Persona e ICP (Ideal Customer Profile).\n3. Estratégias de Copywriting (Gatilhos mentais, objeções) e Storytelling (Jornada do Herói, narrativas).\n4. **Linha Editorial Completa**: Temas, formatos de conteúdo, ganchos e narrativas para atrair o público e prepará-lo para a próxima etapa do funil.`;
    
    if (stage.id === 'livros') {
      prompt += `\n5. Gere um diagrama de fluxo (Mermaid graph TD) visualizando a linha editorial completa para a etapa 'Livros', detalhando a jornada do leitor desde a atração inicial até a conversão para o próximo nível do funil.`;
    } else if (stage.id === 'criativos') {
      prompt += `\n5. Crie um cronograma detalhado para a estruturação editorial da etapa 'Criativos', incluindo prazos estimados e marcos importantes. Use a sintaxe 'gantt' do Mermaid.`;
    }
    
    handleSend(prompt);
  };

  return (
    <div className="flex h-screen w-full relative">
      <div className="scanline"></div>
      
      {/* Sidebar */}
      <aside className="w-80 glass-panel border-r border-cyan-500/30 flex flex-col z-10">
        <div className="p-6 border-b border-cyan-500/20 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-cyan-400 flex items-center gap-2 glow-text tracking-wider">
              <Cpu className="w-6 h-6 text-cyan-400" />
              CAVAN
            </h1>
            <p className="text-xs text-cyan-600 mt-1 font-mono uppercase tracking-widest">Prof. Agent Protocol</p>
          </div>
          <button 
            onClick={handleReset}
            className="p-2 text-cyan-600 hover:text-cyan-300 hover:bg-cyan-900/30 rounded-full transition-all"
            title="Reiniciar Sistema"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="flex items-center gap-2 mb-4 px-2">
            <Activity className="w-4 h-4 text-cyan-500 animate-pulse" />
            <h2 className="text-xs font-semibold text-cyan-500 uppercase tracking-widest">
              Protocolos Rápidos
            </h2>
          </div>
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.id}
              onClick={() => handleSend(action.prompt)}
              disabled={isLoading}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-cyan-100 bg-cyan-950/20 hover:bg-cyan-900/40 hover:text-cyan-50 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-cyan-500/10 hover:border-cyan-400/50 hover:shadow-[0_0_10px_rgba(6,182,212,0.2)] group"
            >
              <div className="text-cyan-600 group-hover:text-cyan-400 transition-colors">
                {action.icon}
              </div>
              {action.label}
            </button>
          ))}
        </div>
        
        <div className="p-6 bg-cyan-950/40 border-t border-cyan-500/20">
          <div className="text-xs text-cyan-600 font-mono">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4" />
              <p className="font-semibold text-cyan-500 uppercase tracking-widest">Estrutura Ativa:</p>
            </div>
            <div className="space-y-1.5">
              {FUNNEL_STAGES.map((stage, index) => (
                <button
                  key={stage.id}
                  onClick={() => handleStageClick(stage)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-between px-3 py-2 text-left text-cyan-100 bg-cyan-900/20 hover:bg-cyan-800/40 rounded-lg transition-all border border-transparent hover:border-cyan-500/30 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-cyan-600 font-bold">{index + 1}.</span>
                    {stage.label}
                  </span>
                  <ChevronRight className="w-3 h-3 text-cyan-700 group-hover:text-cyan-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        
        {/* Top Navigation */}
        <header className="h-16 glass-panel border-b border-cyan-500/20 flex items-center px-6 gap-6">
          <button
            onClick={() => { playSound('beep'); setActiveView('terminal'); }}
            className={cn(
              "relative px-4 py-2 text-sm font-mono tracking-widest uppercase transition-colors",
              activeView === 'terminal' ? "text-cyan-300" : "text-cyan-700 hover:text-cyan-500"
            )}
          >
            <span className="flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Terminal
            </span>
            {activeView === 'terminal' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 glow-border" />
            )}
          </button>
          <button
            onClick={() => { playSound('beep'); setActiveView('analytics'); }}
            className={cn(
              "relative px-4 py-2 text-sm font-mono tracking-widest uppercase transition-colors",
              activeView === 'analytics' ? "text-cyan-300" : "text-cyan-700 hover:text-cyan-500"
            )}
          >
            <span className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Análise de Progressão
            </span>
            {activeView === 'analytics' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 glow-border" />
            )}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth relative">
          <AnimatePresence mode="wait">
            {activeView === 'terminal' ? (
              <motion.div 
                key="terminal"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-4xl mx-auto space-y-8 pb-20"
              >
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={cn(
                      "flex gap-4",
                      msg.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-10 h-10 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center flex-shrink-0 glow-border">
                        <Zap className="w-5 h-5 text-cyan-400" />
                      </div>
                    )}
                    
                    <div 
                      className={cn(
                        "max-w-[85%] px-6 py-4 shadow-sm",
                        msg.role === 'user' 
                          ? "bg-cyan-900/40 border border-cyan-500/50 text-cyan-50 rounded-l-xl rounded-br-xl backdrop-blur-sm" 
                          : "glass-panel border-l-2 border-l-cyan-400 rounded-r-xl rounded-bl-xl text-cyan-100"
                      )}
                    >
                      {msg.role === 'user' ? (
                        <p className="whitespace-pre-wrap font-mono text-sm">{msg.content}</p>
                      ) : (
                        <div className="prose prose-invert prose-cyan max-w-none prose-p:leading-relaxed prose-pre:bg-[#020617]/80 prose-pre:border prose-pre:border-cyan-500/30 prose-pre:text-cyan-300 prose-headings:text-cyan-400 prose-a:text-cyan-400 prose-strong:text-cyan-300 prose-blockquote:border-l-cyan-500 prose-blockquote:bg-cyan-950/20 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({ node, inline, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || '');
                                if (!inline && match && match[1] === 'mermaid') {
                                  const chartContent = String(children).replace(/\n$/, '');
                                  if (!chartContent) return null;
                                  return <Mermaid chart={chartContent} />;
                                }
                                return (
                                  <code className={cn(className, "bg-cyan-950/50 px-1.5 py-0.5 rounded text-sm font-mono text-cyan-300 border border-cyan-500/20")} {...props}>
                                    {children}
                                  </code>
                                );
                              },
                              table({ children }) {
                                return (
                                  <div className="overflow-x-auto my-6">
                                    <table className="min-w-full divide-y divide-cyan-500/20 border border-cyan-500/30 rounded-lg overflow-hidden bg-[#0b1120]/50">
                                      {children}
                                    </table>
                                  </div>
                                );
                              },
                              th({ children }) {
                                return <th className="bg-cyan-950/50 px-4 py-3 text-left text-sm font-semibold text-cyan-400 border-b border-cyan-500/30">{children}</th>;
                              },
                              td({ children }) {
                                return <td className="px-4 py-3 text-sm text-cyan-100 border-t border-cyan-500/10">{children}</td>;
                              }
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-4 justify-start">
                    <div className="w-10 h-10 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center flex-shrink-0 glow-border">
                      <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                    </div>
                    <div className="glass-panel border-l-2 border-l-cyan-400 rounded-r-xl rounded-bl-xl px-6 py-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse glow-border" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse glow-border" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse glow-border" style={{ animationDelay: '300ms' }} />
                      <span className="ml-2 text-xs font-mono text-cyan-500 uppercase tracking-widest">Processando...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </motion.div>
            ) : (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-5xl mx-auto"
              >
                <ProgressionChart />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area (Only visible in Terminal) */}
        <AnimatePresence>
          {activeView === 'terminal' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#030712] via-[#030712]/90 to-transparent pt-10 pb-6 px-6 md:px-10"
            >
              <div className="max-w-4xl mx-auto">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                  className="relative flex items-center glass-panel rounded-full focus-within:border-cyan-400 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all"
                >
                  <div className="absolute left-4 text-cyan-600">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Insira o comando ou diretriz..."
                    className="w-full bg-transparent py-4 pl-12 pr-16 outline-none text-cyan-50 placeholder-cyan-700 font-mono text-sm"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 p-2.5 bg-cyan-600/20 text-cyan-400 rounded-full hover:bg-cyan-500/40 hover:text-cyan-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-cyan-500/30"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
                <div className="flex justify-between items-center mt-3 px-4">
                  <p className="text-xs text-cyan-700 font-mono uppercase tracking-widest">
                    Status: <span className="text-cyan-500">Online</span>
                  </p>
                  <p className="text-xs text-cyan-700 font-mono">
                    SISTEMA SUJEITO A IMPRECISÕES. VERIFIQUE OS DADOS.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: 'Dumela! (Hello!) I am Polelo, your Sesotho STEM Dictionary Assistant, aligned with the UCT MzansiLLM project. Ask me anything about Sesotho STEM word-coining, definitions, or grammatical rules!' }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMessage } as ChatMessage];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        throw new Error('Chat failed');
      }

      const data = await response.json();
      setMessages([...newMessages, { role: 'model', content: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...newMessages,
        { role: 'model', content: 'Ntshwarele (Apologies), I encountered an issue. Please try again. UCT MzansiLLM is online.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 1000,
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 8px 32px 0 rgba(99, 102, 241, 0.4), 0 0 20px 0 rgba(6, 182, 212, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="glow-pulse"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Floating Chat Drawer Container */}
      {isOpen && (
        <div
          className="glass-panel"
          style={{
            position: 'fixed',
            bottom: '6.5rem',
            right: '2rem',
            zIndex: 1000,
            width: '380px',
            height: '520px',
            maxHeight: 'calc(100vh - 10rem)',
            maxWidth: 'calc(100vw - 4rem)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1.25rem',
              background: 'linear-gradient(135deg, rgba(13, 20, 38, 0.9) 0%, rgba(22, 33, 62, 0.95) 100%)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ color: 'var(--secondary)' }}>
                <Sparkles size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', color: 'white', fontWeight: 700 }}>Polelo</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MzansiLLM Assistant (UCT)</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.2rem',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              padding: '1.25rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              background: 'rgba(6, 9, 19, 0.4)',
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                }}
              >
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    lineHeight: '1.45',
                    background: msg.role === 'user' 
                      ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    border: msg.role === 'user'
                      ? 'none'
                      : '1px solid rgba(255,255,255,0.06)',
                    boxShadow: msg.role === 'user'
                      ? '0 4px 12px rgba(99, 102, 241, 0.2)'
                      : 'none',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '0.4rem', padding: '0.5rem 1rem' }}>
                <span className="glow-pulse" style={{ width: '8px', height: '8px', background: 'var(--secondary)', borderRadius: '50%' }}></span>
                <span className="glow-pulse" style={{ width: '8px', height: '8px', background: 'var(--secondary)', borderRadius: '50%', animationDelay: '0.2s' }}></span>
                <span className="glow-pulse" style={{ width: '8px', height: '8px', background: 'var(--secondary)', borderRadius: '50%', animationDelay: '0.4s' }}></span>
              </div>
            )}
          </div>

          {/* Footer Input */}
          <form
            onSubmit={handleSubmit}
            style={{
              padding: '1rem',
              background: 'rgba(13, 20, 38, 0.8)',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              gap: '0.5rem',
            }}
          >
            <input
              type="text"
              placeholder="Ask about coining STEM words..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                background: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.6rem 0.9rem',
                color: 'white',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)',
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

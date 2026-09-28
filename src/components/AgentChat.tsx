import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { askAgent } from '../lib/faq';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

interface AgentChatProps {
  agentSchemaName: string;
  greeting: string;
  starters?: string[];
  placeholder?: string;
}

export function AgentChat({
  agentSchemaName,
  greeting,
  starters = [],
  placeholder = 'Type your message…',
}: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([{ role: 'bot', text: greeting }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setBusy(true);
    try {
      const reply = await askAgent(agentSchemaName, question, conversationId);
      setConversationId(reply.conversationId);
      setMessages((prev) => [...prev, { role: 'bot', text: reply.text }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: 'Sorry, I ran into a problem reaching the assistant. Please try again.' },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card chat">
      {starters.length > 0 && (
        <div className="chat__starters">
          {starters.map((s) => (
            <button key={s} className="starter" onClick={() => send(s)} disabled={busy}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="chat__messages">
        {messages.map((m, i) => (
          <div key={i} className={`msg msg--${m.role}`}>
            {m.role === 'bot' ? (
              <div className="msg__md">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ node, ...props }) => {
                      void node;
                      return <a {...props} target="_blank" rel="noopener noreferrer" />;
                    },
                  }}
                >
                  {m.text}
                </ReactMarkdown>
              </div>
            ) : (
              m.text
            )}
          </div>
        ))}
        {busy && (
          <div className="msg msg--bot msg--typing" aria-label="Assistant is thinking">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        className="chat__input"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          disabled={busy}
          aria-label="Your message"
        />
        <button type="submit" className="btn" disabled={busy || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

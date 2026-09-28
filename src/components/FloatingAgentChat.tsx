import { useState } from 'react';
import { AgentChat } from './AgentChat';

interface FloatingAgentChatProps {
  agentSchemaName: string;
  greeting: string;
  title: string;
  starters?: string[];
  placeholder?: string;
}

export function FloatingAgentChat({
  agentSchemaName,
  greeting,
  title,
  starters,
  placeholder,
}: FloatingAgentChatProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fab-chat">
      {open && (
        <div className="fab-chat__panel" role="dialog" aria-label={title}>
          <div className="fab-chat__header">
            <span className="fab-chat__title">{title}</span>
            <button
              className="fab-chat__close"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>
          <AgentChat
            agentSchemaName={agentSchemaName}
            greeting={greeting}
            starters={starters}
            placeholder={placeholder}
          />
        </div>
      )}
      <button
        className="fab-chat__button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        aria-expanded={open}
      >
        {open ? '✕' : '💬'}
      </button>
    </div>
  );
}

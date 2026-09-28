import { AgentChat } from '../components/AgentChat';

const STARTERS = [
  'How many holiday days do I have left?',
  'How do I request parental leave?',
  'What is the sickness policy?',
  'Who approves my absence requests?',
];

export function FaqPage() {
  return (
    <main className="page">
      <div className="page__header">
        <h1>HR FAQ Assistant</h1>
        <div className="page__subtitle">Powered by the proMX HR Copilot Studio agent.</div>
      </div>

      <AgentChat
        agentSchemaName="npmx_proMXHR"
        greeting="Hi! I'm the proMX HR assistant. Ask me anything about holidays, absences, or HR policies."
        starters={STARTERS}
        placeholder="Type your question…"
      />
    </main>
  );
}

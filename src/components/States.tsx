interface StateProps {
  message?: string;
}

export function Loader({ message = 'Loading…' }: StateProps) {
  return (
    <div className="state">
      <div className="spinner" />
      {message}
    </div>
  );
}

export function EmptyState({ message = 'Nothing to show here yet.' }: StateProps) {
  return <div className="state">{message}</div>;
}

export function ErrorState({ message = 'Something went wrong loading this data.' }: StateProps) {
  return <div className="state">{message}</div>;
}

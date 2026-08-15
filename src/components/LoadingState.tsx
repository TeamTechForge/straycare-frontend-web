import "./LoadingState.css";

interface LoadingStateProps {
  label?: string;
}

export default function LoadingState({ label = "Loading..." }: LoadingStateProps) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <span className="loading-state-spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

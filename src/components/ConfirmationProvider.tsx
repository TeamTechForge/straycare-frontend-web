import { createContext, useContext, useRef, useState } from "react";
import type { ReactNode } from "react";
import "./ConfirmationProvider.css";

interface ConfirmationOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  tone?: "warning" | "danger";
}

interface PendingConfirmation extends ConfirmationOptions {
  resolve: (confirmed: boolean) => void;
}

const ConfirmationContext = createContext<
  ((options: ConfirmationOptions) => Promise<boolean>) | null
>(null);

export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirmation | null>(null);
  const resolverRef = useRef<((confirmed: boolean) => void) | null>(null);

  const confirm = (options: ConfirmationOptions) =>
    new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setPending({ ...options, resolve });
    });

  const finish = (confirmed: boolean) => {
    resolverRef.current?.(confirmed);
    resolverRef.current = null;
    setPending(null);
  };

  return (
    <ConfirmationContext.Provider value={confirm}>
      {children}
      {pending && (
        <div className="confirmation-backdrop" role="presentation" onMouseDown={() => finish(false)}>
          <div
            className="confirmation-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirmation-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className={`confirmation-icon ${pending.tone || "warning"}`}>!</div>
            <h2 id="confirmation-title">{pending.title || "Confirm action"}</h2>
            <p>{pending.message}</p>
            <div className="confirmation-actions">
              <button className="confirmation-cancel" onClick={() => finish(false)}>Cancel</button>
              <button
                className={`confirmation-submit ${pending.tone || "warning"}`}
                onClick={() => finish(true)}
              >
                {pending.confirmLabel || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmationContext.Provider>
  );
}

export function useConfirmation() {
  const confirm = useContext(ConfirmationContext);
  if (!confirm) throw new Error("useConfirmation must be used within ConfirmationProvider");
  return confirm;
}

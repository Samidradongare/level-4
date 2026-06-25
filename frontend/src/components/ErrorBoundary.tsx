import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by boundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 20px',
          maxWidth: '500px',
          margin: '80px auto',
          textAlign: 'center',
        }} className="glass-panel">
          <span style={{ fontSize: '3rem' }}>⚠️</span>
          <h2 style={{ margin: '16px 0 8px', fontFamily: 'var(--font-display)' }}>Something went wrong.</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
            {this.state.error?.message || 'An unexpected rendering error occurred.'}
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;

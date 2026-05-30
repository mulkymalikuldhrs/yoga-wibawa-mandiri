import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error for debugging (no PII)
    if (import.meta.env.DEV) console.error('[ErrorBoundary]', error.message, errorInfo.componentStack);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="glassmorphic-bg min-h-screen flex items-center justify-center p-4">
          <div className="glass-frosted rounded-2xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100/80 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">!</span>
            </div>
            <h2 className="text-slate-800 text-xl font-semibold mb-2">
              Terjadi Kesalahan
            </h2>
            <p className="text-slate-500 text-sm mb-4">
              Aplikasi mengalami error yang tidak terduga. Silakan muat ulang halaman.
            </p>
            <p className="text-red-500/80 text-xs mb-6 font-mono">
              {this.state.error?.message}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-white/50 border border-white/60 rounded-lg text-slate-600 text-sm hover:bg-white/70 transition-all"
              >
                Coba Lagi
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-cyan-100/80 border border-cyan-200/50 rounded-lg text-cyan-600 text-sm hover:bg-cyan-100 transition-all"
              >
                Muat Ulang
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

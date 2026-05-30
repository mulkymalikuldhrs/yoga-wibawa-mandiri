// ============================================================
// ModuleErrorBoundary — Per-module error boundary
// Prevents a single module crash from taking down the dashboard
// ============================================================

import React from 'react';

interface Props {
  children: React.ReactNode;
  moduleName: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ModuleErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold text-red-400 mb-2">Module Error</h2>
          <p className="text-white/60 mb-4">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-blue-600 rounded-lg"
          >
            Coba Lagi
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

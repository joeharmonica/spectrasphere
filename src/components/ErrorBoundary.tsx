import { Component } from 'react'
import type { ReactNode } from 'react'

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="w-full h-full flex items-center justify-center bg-slate-50 p-6">
                    <div className="max-w-xl w-full bg-white rounded-xl border border-red-200 shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-red-600 mb-2">Something went wrong</h2>
                        <p className="text-sm text-slate-600 mb-4">An error occurred while rendering this component.</p>
                        <div className="bg-red-50 p-4 rounded-lg overflow-auto border border-red-100">
                            <pre className="text-xs text-red-700 whitespace-pre-wrap font-mono">
                                {this.state.error?.message}
                                {'\n\n'}
                                {this.state.error?.stack}
                            </pre>
                        </div>
                        <button
                            onClick={() => this.setState({ hasError: false, error: null })}
                            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

import { Component } from 'react';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('[SmartRail ErrorBoundary]', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    background: '#0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                    padding: '2rem',
                }}>
                    <div style={{ textAlign: 'center', maxWidth: 420 }}>
                        <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
                        <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
                            Something went wrong
                        </h1>
                        <p style={{ color: '#94a3b8', marginBottom: 8 }}>
                            {this.state.error?.message || 'An unexpected error occurred.'}
                        </p>
                        <p style={{ color: '#475569', fontSize: 13, marginBottom: 24 }}>
                            Please refresh the page. If the issue persists, contact support.
                        </p>
                        <button
                            onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/'; }}
                            style={{
                                background: '#e2e8f0',
                                color: '#0f172a',
                                border: 'none',
                                borderRadius: 12,
                                padding: '12px 28px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontSize: 15,
                            }}
                        >
                            ← Go Home
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

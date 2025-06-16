import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-6 text-center h-full min-h-[300px]">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg max-w-md w-full">
            <h2 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
              Algo salió mal
            </h2>
            <p className="text-red-700 dark:text-red-300 text-sm mb-4">
              Lo sentimos, ocurrió un error al cargar el contenido.
            </p>
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded text-sm text-red-700 dark:text-red-300 mb-4 text-left">
              {this.state.error?.message || 'Error desconocido'}
            </div>
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

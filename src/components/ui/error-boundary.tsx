"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-melodia-cream">
          <div className="max-w-md w-full text-center">
            <div className="bg-white rounded-xl shadow-elegant p-8">
              <AlertTriangle className="h-16 w-16 text-melodia-coral mx-auto mb-6" />
              <h2 className="text-2xl font-heading font-bold text-melodia-teal mb-3">
                Something went wrong
              </h2>
              <p className="text-lg font-body text-melodia-teal mb-8 leading-relaxed">
                We encountered an unexpected error. Please try refreshing the
                page.
              </p>
              <div className="space-y-4">
                <Button
                  onClick={this.handleRetry}
                  className="w-full bg-melodia-yellow hover:bg-gradient-to-r hover:from-melodia-yellow hover:to-melodia-coral text-melodia-teal font-heading font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="w-full bg-white hover:bg-melodia-teal-light text-melodia-teal hover:text-melodia-teal font-heading font-semibold py-3 px-6 rounded-xl transition-all duration-300 border-2 border-melodia-coral hover:border-melodia-coral shadow-lg hover:shadow-xl"
                >
                  Refresh Page
                </Button>
              </div>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mt-8 text-left">
                  <summary className="cursor-pointer text-sm font-body text-melodia-teal hover:text-melodia-coral transition-colors">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-3 text-xs font-body text-melodia-coral bg-melodia-coral-15 p-4 rounded-lg overflow-auto border border-melodia-coral-20">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

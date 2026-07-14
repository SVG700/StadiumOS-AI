'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

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
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error inside Dashboard Boundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Card className="max-w-xl mx-auto my-12 bg-rose-950/10 border-rose-900/50 p-6 text-center space-y-4">
          <CardHeader className="flex flex-col items-center">
            <AlertTriangle className="h-10 w-10 text-rose-500 animate-bounce" />
            <CardTitle className="text-lg font-black text-white mt-2">
              Console Module Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              An unexpected error occurred in this command block. The system telemetry remains fully stable.
            </p>
            <div className="text-left bg-slate-950 p-3 rounded-lg border border-slate-900/80 font-mono text-[10px] text-rose-400 overflow-x-auto">
              {this.state.error?.message || 'Error: Unknown runtime issue'}
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="text-xs border-slate-800 text-slate-300 cursor-pointer"
              >
                Reload Window
              </Button>
              <Button
                size="sm"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="text-xs bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              >
                Retry Module
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

import { useState } from 'react';
import { WebcamMonitor } from './WebcamMonitor';
import { TypingMonitor } from './TypingMonitor';
import { FatigueStatus } from './FatigueStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Shield, Clock, BarChart3, Play, Square } from 'lucide-react';

export const Dashboard = () => {
  const [facialMetrics, setFacialMetrics] = useState(null);
  const [typingMetrics, setTypingMetrics] = useState(null);
  const [sessionStart] = useState(Date.now());
  const [isMonitoring, setIsMonitoring] = useState(true);

  const getSessionDuration = () => {
    const duration = Math.floor((Date.now() - sessionStart) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                Mental Fatigue Monitor
              </h1>
              <p className="text-muted-foreground">
                Real-time analysis of cognitive performance
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-mono">{getSessionDuration()}</span>
            </div>
            <Button
              onClick={() => setIsMonitoring(!isMonitoring)}
              variant={isMonitoring ? "destructive" : "default"}
              size="sm"
              className="flex items-center gap-2"
            >
              {isMonitoring ? (
                <>
                  <Square className="h-4 w-4" />
                  Stop Monitoring
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Monitoring
                </>
              )}
            </Button>
            <Badge variant="outline" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Privacy Protected
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Webcam Monitor */}
        <div className="lg:col-span-1">
          <WebcamMonitor onMetricsUpdate={setFacialMetrics} isActive={isMonitoring} />
        </div>
        
        {/* Typing Monitor */}
        <div className="lg:col-span-1">
          <TypingMonitor onMetricsUpdate={setTypingMetrics} isActive={isMonitoring} />
        </div>
        
        {/* Fatigue Status */}
        <div className="lg:col-span-1">
          <FatigueStatus 
            facialMetrics={facialMetrics} 
            typingMetrics={typingMetrics}
          />
        </div>
      </div>

      {/* Session Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Session Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-card/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {typingMetrics?.wpm || 0}
              </div>
              <div className="text-sm text-muted-foreground">Words/min</div>
            </div>
            
            <div className="text-center p-4 bg-card/50 rounded-lg">
              <div className="text-2xl font-bold text-status-focused">
                {typingMetrics?.accuracy || 100}%
              </div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>
            
            <div className="text-center p-4 bg-card/50 rounded-lg">
              <div className="text-2xl font-bold text-status-tired">
                {facialMetrics?.blinkRate?.toFixed(1) || 0}
              </div>
              <div className="text-sm text-muted-foreground">Blinks/min</div>
            </div>
            
            <div className="text-center p-4 bg-card/50 rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {getSessionDuration()}
              </div>
              <div className="text-sm text-muted-foreground">Session time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border/50">
        <div className="flex items-start gap-2">
          <Shield className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-medium text-sm">Privacy & Security</h3>
            <p className="text-xs text-muted-foreground mt-1">
              All analysis is performed locally in your browser. No video or typing data is stored or transmitted to external servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
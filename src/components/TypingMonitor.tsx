import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Keyboard, TrendingUp, Clock, AlertCircle } from 'lucide-react';

interface TypingMetrics {
  wpm: number;
  accuracy: number;
  errorRate: number;
  avgPauseTime: number;
  totalKeystrokes: number;
  totalTime: number;
}

interface TypingMonitorProps {
  onMetricsUpdate: (metrics: TypingMetrics) => void;
  isActive: boolean;
}

export const TypingMonitor = ({ onMetricsUpdate, isActive }: TypingMonitorProps) => {
  const [text, setText] = useState('');
  const [metrics, setMetrics] = useState<TypingMetrics>({
    wpm: 0,
    accuracy: 100,
    errorRate: 0,
    avgPauseTime: 0,
    totalKeystrokes: 0,
    totalTime: 0
  });
  
  const keystrokeTimesRef = useRef<number[]>([]);
  const errorsRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const lastKeystrokeRef = useRef<number>(Date.now());
  const pausesRef = useRef<number[]>([]);

  const calculateMetrics = () => {
    const now = Date.now();
    const totalTime = (now - startTimeRef.current) / 1000; // in seconds
    const keystrokes = keystrokeTimesRef.current.length;
    
    if (keystrokes === 0 || totalTime === 0) return metrics;

    // Calculate WPM (assuming 5 characters per word)
    const words = text.length / 5;
    const minutes = totalTime / 60;
    const wpm = minutes > 0 ? Math.round(words / minutes) : 0;

    // Calculate accuracy
    const accuracy = keystrokes > 0 ? Math.max(0, 100 - (errorsRef.current / keystrokes) * 100) : 100;

    // Calculate error rate
    const errorRate = keystrokes > 0 ? (errorsRef.current / keystrokes) * 100 : 0;

    // Calculate average pause time
    const avgPauseTime = pausesRef.current.length > 0 
      ? pausesRef.current.reduce((a, b) => a + b, 0) / pausesRef.current.length 
      : 0;

    const newMetrics = {
      wpm,
      accuracy: Math.round(accuracy),
      errorRate: Math.round(errorRate * 10) / 10,
      avgPauseTime: Math.round(avgPauseTime),
      totalKeystrokes: keystrokes,
      totalTime: Math.round(totalTime)
    };

    setMetrics(newMetrics);
    onMetricsUpdate(newMetrics);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const now = Date.now();
    const timeSinceLastKeystroke = now - lastKeystrokeRef.current;
    
    // Record keystroke timing
    keystrokeTimesRef.current.push(now);
    
    // Track pauses (longer than 500ms)
    if (timeSinceLastKeystroke > 500 && keystrokeTimesRef.current.length > 1) {
      pausesRef.current.push(timeSinceLastKeystroke);
    }
    
    // Simulate error detection (in real app, this would be more sophisticated)
    if (Math.random() < 0.02) { // 2% chance of registering an error
      errorsRef.current++;
    }
    
    lastKeystrokeRef.current = now;
  };

  const handleTextChange = (value: string) => {
    setText(value);
    calculateMetrics();
  };

  const resetStats = () => {
    setText('');
    keystrokeTimesRef.current = [];
    errorsRef.current = 0;
    startTimeRef.current = Date.now();
    lastKeystrokeRef.current = Date.now();
    pausesRef.current = [];
    setMetrics({
      wpm: 0,
      accuracy: 100,
      errorRate: 0,
      avgPauseTime: 0,
      totalKeystrokes: 0,
      totalTime: 0
    });
  };

  useEffect(() => {
    const interval = setInterval(calculateMetrics, 1000);
    return () => clearInterval(interval);
  }, [text]);

  const getWpmBadgeVariant = () => {
    if (metrics.wpm >= 40) return "secondary";
    if (metrics.wpm >= 20) return "outline";
    return "destructive";
  };

  const getAccuracyBadgeVariant = () => {
    if (metrics.accuracy >= 95) return "secondary";
    if (metrics.accuracy >= 85) return "outline";
    return "destructive";
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Keyboard className="h-5 w-5 text-primary" />
            Typing Analysis
          </CardTitle>
          <button
            onClick={resetStats}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Reset
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isActive ? "Start typing here to begin monitoring your typing patterns..." : "Monitoring stopped - click Start Monitoring to resume"}
          className="min-h-[120px] resize-none"
          disabled={!isActive}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Speed</span>
              </div>
              <Badge variant={getWpmBadgeVariant()}>
                {metrics.wpm} WPM
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Accuracy</span>
              <Badge variant={getAccuracyBadgeVariant()}>
                {metrics.accuracy}%
              </Badge>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium">Errors</span>
              </div>
              <Badge variant={metrics.errorRate > 5 ? "destructive" : "secondary"}>
                {metrics.errorRate}%
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Avg Pause</span>
              </div>
              <Badge variant={metrics.avgPauseTime > 2000 ? "destructive" : "secondary"}>
                {(metrics.avgPauseTime / 1000).toFixed(1)}s
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="pt-2 border-t border-border">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{metrics.totalKeystrokes} keystrokes</span>
            <span>{Math.floor(metrics.totalTime / 60)}:{(metrics.totalTime % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
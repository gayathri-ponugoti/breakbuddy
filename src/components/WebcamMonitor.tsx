import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Camera, AlertTriangle } from 'lucide-react';

interface FacialMetrics {
  blinkRate: number;
  eyeOpenness: number;
  headPose: number;
  lastBlink: number;
}

interface WebcamMonitorProps {
  onMetricsUpdate: (metrics: FacialMetrics) => void;
}

export const WebcamMonitor = ({ onMetricsUpdate }: WebcamMonitorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [metrics, setMetrics] = useState<FacialMetrics>({
    blinkRate: 0,
    eyeOpenness: 1,
    headPose: 0,
    lastBlink: Date.now()
  });
  const [error, setError] = useState<string>('');

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
        setError('');
      }
    } catch (err) {
      setError('Unable to access webcam. Please check permissions.');
      console.error('Webcam error:', err);
    }
  };

  // Simulate facial analysis (in a real app, this would use MediaPipe or similar)
  const analyzeFace = () => {
    if (!isStreaming) return;

    // Simulate blink detection
    const now = Date.now();
    const timeSinceBlink = now - metrics.lastBlink;
    const shouldBlink = Math.random() < 0.02; // 2% chance per frame
    
    let newMetrics = { ...metrics };
    
    if (shouldBlink && timeSinceBlink > 200) {
      newMetrics.lastBlink = now;
      newMetrics.blinkRate = Math.min(newMetrics.blinkRate + 1, 20);
    }
    
    // Simulate eye openness variation
    newMetrics.eyeOpenness = 0.7 + Math.random() * 0.3;
    
    // Simulate head pose (tired = more head drooping)
    newMetrics.headPose = (Math.random() - 0.5) * 20;
    
    // Decay blink rate over time
    if (timeSinceBlink > 5000) {
      newMetrics.blinkRate = Math.max(0, newMetrics.blinkRate - 0.1);
    }

    setMetrics(newMetrics);
    onMetricsUpdate(newMetrics);
  };

  useEffect(() => {
    startWebcam();
    
    const interval = setInterval(analyzeFace, 100); // 10 FPS analysis
    
    return () => {
      clearInterval(interval);
      // Cleanup webcam stream
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    analyzeFace();
  }, [isStreaming]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Camera className="h-5 w-5 text-primary" />
          Facial Monitoring
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full h-48 bg-secondary rounded-lg object-cover"
            muted
            playsInline
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full opacity-30"
          />
          {!isStreaming && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-secondary/80 rounded-lg">
              <p className="text-muted-foreground">Starting webcam...</p>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-destructive/20 rounded-lg">
              <div className="text-center p-4">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Blink Rate</span>
              <Badge variant={metrics.blinkRate > 15 ? "destructive" : "secondary"}>
                {metrics.blinkRate.toFixed(1)}/min
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Eye Openness</span>
              <Badge variant={metrics.eyeOpenness < 0.7 ? "destructive" : "secondary"}>
                {(metrics.eyeOpenness * 100).toFixed(0)}%
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Head Pose</span>
              <Badge variant={Math.abs(metrics.headPose) > 15 ? "destructive" : "secondary"}>
                {metrics.headPose.toFixed(1)}°
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Tracking Active</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
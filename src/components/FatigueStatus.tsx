import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Activity, Zap, AlertTriangle } from 'lucide-react';

type FatigueLevel = 'focused' | 'slightly-tired' | 'very-tired';

interface FatigueData {
  level: FatigueLevel;
  confidence: number;
  factors: {
    facial: number;
    typing: number;
    overall: number;
  };
  recommendations: string[];
}

interface FatigueStatusProps {
  facialMetrics: any;
  typingMetrics: any;
}

export const FatigueStatus = ({ facialMetrics, typingMetrics }: FatigueStatusProps) => {
  const [fatigueData, setFatigueData] = useState<FatigueData>({
    level: 'focused',
    confidence: 85,
    factors: {
      facial: 85,
      typing: 90,
      overall: 87
    },
    recommendations: ['Keep up the good work!', 'Stay hydrated']
  });

  const calculateFatigue = () => {
    // Facial fatigue scoring (0-100, higher = more tired)
    let facialScore = 0;
    if (facialMetrics) {
      // High blink rate indicates tiredness
      if (facialMetrics.blinkRate > 20) facialScore += 30;
      else if (facialMetrics.blinkRate > 15) facialScore += 15;
      
      // Low eye openness indicates tiredness
      if (facialMetrics.eyeOpenness < 0.6) facialScore += 40;
      else if (facialMetrics.eyeOpenness < 0.8) facialScore += 20;
      
      // Head drooping indicates tiredness
      if (Math.abs(facialMetrics.headPose) > 20) facialScore += 30;
      else if (Math.abs(facialMetrics.headPose) > 10) facialScore += 15;
    }

    // Typing fatigue scoring
    let typingScore = 0;
    if (typingMetrics) {
      // Low WPM indicates tiredness
      if (typingMetrics.wpm < 20 && typingMetrics.totalKeystrokes > 20) typingScore += 25;
      else if (typingMetrics.wpm < 30 && typingMetrics.totalKeystrokes > 20) typingScore += 15;
      
      // High error rate indicates tiredness
      if (typingMetrics.errorRate > 10) typingScore += 30;
      else if (typingMetrics.errorRate > 5) typingScore += 15;
      
      // Long pauses indicate tiredness
      if (typingMetrics.avgPauseTime > 3000) typingScore += 25;
      else if (typingMetrics.avgPauseTime > 2000) typingScore += 15;
      
      // Low accuracy indicates tiredness
      if (typingMetrics.accuracy < 80) typingScore += 20;
      else if (typingMetrics.accuracy < 90) typingScore += 10;
    }

    // Combine scores
    const overallScore = (facialScore + typingScore) / 2;
    
    // Determine fatigue level
    let level: FatigueLevel;
    let recommendations: string[] = [];
    
    if (overallScore < 30) {
      level = 'focused';
      recommendations = [
        'Great focus! Keep it up',
        'Maintain good posture',
        'Stay hydrated'
      ];
    } else if (overallScore < 60) {
      level = 'slightly-tired';
      recommendations = [
        'Consider taking a short break',
        'Do some eye exercises',
        'Check your lighting',
        'Adjust your posture'
      ];
    } else {
      level = 'very-tired';
      recommendations = [
        'Take a 10-15 minute break',
        'Get some fresh air',
        'Do stretching exercises',
        'Consider ending your session'
      ];
    }

    const confidence = Math.max(60, 100 - Math.abs(overallScore - 50));

    setFatigueData({
      level,
      confidence: Math.round(confidence),
      factors: {
        facial: Math.max(0, 100 - facialScore),
        typing: Math.max(0, 100 - typingScore),
        overall: Math.max(0, 100 - overallScore)
      },
      recommendations
    });
  };

  useEffect(() => {
    calculateFatigue();
  }, [facialMetrics, typingMetrics]);

  const getLevelColor = () => {
    switch (fatigueData.level) {
      case 'focused': return 'text-status-focused';
      case 'slightly-tired': return 'text-status-tired';
      case 'very-tired': return 'text-status-very-tired';
    }
  };

  const getLevelBadgeVariant = () => {
    switch (fatigueData.level) {
      case 'focused': return 'secondary';
      case 'slightly-tired': return 'outline';
      case 'very-tired': return 'destructive';
    }
  };

  const getLevelIcon = () => {
    switch (fatigueData.level) {
      case 'focused': return <Zap className="h-5 w-5 text-status-focused" />;
      case 'slightly-tired': return <Activity className="h-5 w-5 text-status-tired" />;
      case 'very-tired': return <AlertTriangle className="h-5 w-5 text-status-very-tired" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-primary" />
          Fatigue Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Status */}
        <div className="text-center space-y-3">
          {getLevelIcon()}
          <div>
            <h3 className={`text-2xl font-bold capitalize ${getLevelColor()}`}>
              {fatigueData.level.replace('-', ' ')}
            </h3>
            <p className="text-sm text-muted-foreground">
              Confidence: {fatigueData.confidence}%
            </p>
          </div>
          <Badge variant={getLevelBadgeVariant()} className="text-xs">
            {fatigueData.level.replace('-', ' ').toUpperCase()}
          </Badge>
        </div>

        {/* Factor Breakdown */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Performance Factors</h4>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Facial Alertness</span>
                <span>{fatigueData.factors.facial}%</span>
              </div>
              <Progress value={fatigueData.factors.facial} className="h-2" />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Typing Performance</span>
                <span>{fatigueData.factors.typing}%</span>
              </div>
              <Progress value={fatigueData.factors.typing} className="h-2" />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm font-medium">
                <span>Overall Score</span>
                <span>{fatigueData.factors.overall}%</span>
              </div>
              <Progress value={fatigueData.factors.overall} className="h-2" />
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Recommendations</h4>
          <ul className="space-y-1">
            {fatigueData.recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface AnalyticsData {
  overallCompletion: number;
  phaseCompletion: Map<string, number>;
  averageTimePerStep: number;
  fastestPhase: string | null;
  slowestPhase: string | null;
  completionRate: number;
}

const AnalyticsDashboard = ({ churchId }: { churchId: string }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [churchId]);

  const loadAnalytics = async () => {
    // Fetch all progress data
    const { data: phaseProgress } = await supabase
      .from("church_planning_progress")
      .select("*")
      .eq("church_id", churchId);

    const { data: stepProgress } = await supabase
      .from("church_step_progress")
      .select("*")
      .eq("church_id", churchId);

    if (!phaseProgress || !stepProgress) return;

    // Calculate analytics
    const totalPhases = 9;
    const completedPhases = phaseProgress.filter(p => p.status === 'completed').length;
    const overallCompletion = (completedPhases / totalPhases) * 100;

    // Calculate time per step
    const completedSteps = stepProgress.filter(s => s.status === 'completed' && s.started_at && s.completed_at);
    let avgTime = 0;
    if (completedSteps.length > 0) {
      const totalMinutes = completedSteps.reduce((sum, step) => {
        const start = new Date(step.started_at).getTime();
        const end = new Date(step.completed_at).getTime();
        return sum + (end - start) / (1000 * 60);
      }, 0);
      avgTime = Math.round(totalMinutes / completedSteps.length);
    }

    // Find fastest/slowest phases
    const phaseTimes = new Map<string, number>();
    phaseProgress.forEach(p => {
      if (p.started_at && p.completed_at) {
        const minutes = (new Date(p.completed_at).getTime() - new Date(p.started_at).getTime()) / (1000 * 60);
        phaseTimes.set(p.phase_id, minutes);
      }
    });

    let fastestPhaseId = null;
    let slowestPhaseId = null;
    let minTime = Infinity;
    let maxTime = 0;

    phaseTimes.forEach((time, phaseId) => {
      if (time < minTime) {
        minTime = time;
        fastestPhaseId = phaseId;
      }
      if (time > maxTime) {
        maxTime = time;
        slowestPhaseId = phaseId;
      }
    });

    // Calculate completion rate (steps started vs completed)
    const totalSteps = stepProgress.length;
    const completedStepsCount = stepProgress.filter(s => s.status === 'completed').length;
    const completionRate = totalSteps > 0 ? (completedStepsCount / totalSteps) * 100 : 0;

    setAnalytics({
      overallCompletion,
      phaseCompletion: new Map(),
      averageTimePerStep: avgTime,
      fastestPhase: fastestPhaseId,
      slowestPhase: slowestPhaseId,
      completionRate,
    });

    setLoading(false);
  };

  if (loading || !analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>Loading analytics data...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Overall Completion</CardTitle>
          <CardDescription>Phase-based progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={analytics.overallCompletion} className="h-4" />
            <p className="text-2xl font-bold">{Math.round(analytics.overallCompletion)}%</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Average Time per Step</CardTitle>
          <CardDescription>From completed steps</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{analytics.averageTimePerStep} min</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Completion Rate</CardTitle>
          <CardDescription>Steps completed vs started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={analytics.completionRate} className="h-4" />
            <p className="text-2xl font-bold">{Math.round(analytics.completionRate)}%</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;


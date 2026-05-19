import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { goalsAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Input, Select, Card, Badge } from '../../components/ui';
import { ACHIEVEMENT_STATUSES, QUARTERS, formatLabel } from '../../utils/validation';

export default function Achievements() {
  const year = new Date().getFullYear();
  const [quarter, setQuarter] = useState('Q1');
  const [sheet, setSheet] = useState(null);
  const [goalsWithProgress, setGoalsWithProgress] = useState([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  const load = () => {
    setLoading(true);
    goalsAPI
      .getMySheet({ year, quarter })
      .then((res) => {
        setSheet(res.data.goalSheet);
        setGoalsWithProgress(res.data.goalsWithProgress || []);
        setOverallProgress(res.data.overallProgress || 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [year, quarter]);

  const updateAchievement = async (goalId, field, value) => {
    if (sheet?.status !== 'approved') {
      toast.error('Goals must be approved before updating achievements');
      return;
    }
    setSaving(goalId);
    try {
      const goal = sheet.goals.find((g) => g._id === goalId);
      const qa = goal?.quarterlyAchievements?.find((q) => q.quarter === quarter) || {};
      const payload = {
        year,
        goalId,
        quarter,
        achievement: field === 'achievement' ? value : qa.achievement,
        status: field === 'status' ? value : qa.status,
        completedDate: field === 'completedDate' ? value : qa.completedDate,
      };
      const { data } = await goalsAPI.updateAchievement(payload);
      setSheet(data.goalSheet);
      setOverallProgress(data.overallProgress);
      load();
      toast.success('Achievement updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <LoadingSpinner className="py-20" />;

  const getBadgeVariant = (status) => {
    if (status === 'approved') return 'success';
    if (status === 'rejected') return 'danger';
    if (status === 'submitted') return 'primary';
    if (status === 'rework') return 'warning';
    return 'default';
  };

  if (sheet?.status !== 'approved') {
    return (
      <Card padding="lg" className="text-center py-12">
        <p className="text-slate-600">
          Your goals must be approved before you can update quarterly achievements.
        </p>
        <p className="mt-2">
          Current status:{' '}
          <Badge variant={getBadgeVariant(sheet?.status)}>
            {formatLabel(sheet?.status || 'draft')}
          </Badge>
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Quarterly Achievements</h1>
          <p className="page-subtitle">FY {year}</p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={quarter}
            onChange={(e) => setQuarter(e.target.value)}
            options={QUARTERS.map((q) => ({ value: q, label: q }))}
            className="w-auto"
          />
          <Card padding="sm" className="text-right">
            <p className="text-xs text-slate-500">Overall progress</p>
            <p className="text-2xl font-bold text-brand-600">{overallProgress}%</p>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        {goalsWithProgress.map((goal) => {
          const qa = goal.quarterlyAchievements?.find((q) => q.quarter === quarter) || {};
          return (
            <Card key={goal._id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="section-title">{goal.title}</h3>
                  <p className="text-sm text-slate-500">{goal.thrustArea} · {formatLabel(goal.unitOfMeasurement)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Computed progress</p>
                  <p className="text-xl font-bold text-green-600">
                    {goal.computedProgress ?? qa.progress ?? 0}%
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <Input
                    label="Achievement value"
                    type={goal.unitOfMeasurement === 'timeline' ? 'date' : 'number'}
                    value={
                      goal.unitOfMeasurement === 'timeline' && qa.achievement
                        ? new Date(qa.achievement).toISOString().split('T')[0]
                        : qa.achievement ?? ''
                    }
                    onChange={(e) => {
                      const val =
                        goal.unitOfMeasurement === 'timeline'
                          ? new Date(e.target.value).toISOString()
                          : Number(e.target.value);
                      updateAchievement(goal._id, 'achievement', val);
                    }}
                    disabled={saving === goal._id}
                    helperText={`Target: ${String(goal.target)}`}
                  />
                </div>
                <div>
                  <Select
                    label="Status"
                    value={qa.status || 'not_started'}
                    onChange={(e) => updateAchievement(goal._id, 'status', e.target.value)}
                    disabled={saving === goal._id}
                    options={ACHIEVEMENT_STATUSES}
                  />
                </div>
                <div>
                  <Input
                    label="Weightage"
                    value={`${goal.weightage}%`}
                    disabled
                    className="bg-slate-50"
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { goalsAPI, commonAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Button, Input, Select, Textarea, Card, Badge } from '../../components/ui';
import {
  validateGoals,
  UNITS,
  MAX_GOALS,
  MIN_WEIGHTAGE,
  REQUIRED_TOTAL,
  formatLabel,
} from '../../utils/validation';

const emptyGoal = () => ({
  title: '',
  description: '',
  thrustArea: '',
  unitOfMeasurement: 'numeric',
  target: '',
  weightage: MIN_WEIGHTAGE,
});

export default function GoalSheet() {
  const year = new Date().getFullYear();
  const [goals, setGoals] = useState([emptyGoal()]);
  const [thrustAreas, setThrustAreas] = useState([]);
  const [sheet, setSheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const canEdit = !sheet || ['draft', 'rework', 'rejected'].includes(sheet.status);
  const totalWeight = goals.reduce((s, g) => s + (Number(g.weightage) || 0), 0);
  
  const getBadgeVariant = (status) => {
    if (status === 'approved') return 'success';
    if (status === 'rejected') return 'danger';
    if (status === 'submitted') return 'primary';
    return 'default';
  };

  useEffect(() => {
    Promise.all([goalsAPI.getMySheet({ year }), commonAPI.getThrustAreas()])
      .then(([sheetRes, thrustRes]) => {
        setSheet(sheetRes.data.goalSheet);
        if (sheetRes.data.goalSheet?.goals?.length) {
          setGoals(sheetRes.data.goalSheet.goals);
        }
        setThrustAreas(thrustRes.data.thrustAreas);
      })
      .finally(() => setLoading(false));
  }, [year]);

  const updateGoal = (index, field, value) => {
    setGoals((prev) => prev.map((g, i) => (i === index ? { ...g, [field]: value } : g)));
  };

  const addGoal = () => {
    if (goals.length >= MAX_GOALS) {
      toast.error(`Maximum ${MAX_GOALS} goals allowed`);
      return;
    }
    setGoals([...goals, emptyGoal()]);
  };

  const removeGoal = (index) => {
    if (goals.length <= 1) return;
    setGoals(goals.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await goalsAPI.updateMySheet({ year, goals });
      setSheet(data.goalSheet);
      toast.success('Goals saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    const errors = validateGoals(goals);
    if (errors.length) {
      errors.forEach((e) => toast.error(e));
      return;
    }
    setSaving(true);
    try {
      await goalsAPI.updateMySheet({ year, goals });
      const { data } = await goalsAPI.submit({ year });
      setSheet(data.goalSheet);
      toast.success('Goals submitted for manager approval');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submit failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner className="py-20" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Goal Sheet — FY {year}</h1>
          {sheet?.status && (
            <Badge 
              variant={getBadgeVariant(sheet.status)}
              className="mt-2"
            >
              {formatLabel(sheet.status)}
            </Badge>
          )}
        </div>
        <Card padding="sm" className="text-right">
          <p className="text-sm text-slate-500">Total weightage</p>
          <p
            className={`text-xl font-bold ${
              totalWeight === REQUIRED_TOTAL ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {totalWeight}% / {REQUIRED_TOTAL}%
          </p>
        </Card>
      </div>

      {sheet?.rejectionReason && (
        <Card padding="sm" className="border-red-200 bg-red-50">
          <p className="text-sm text-red-700">
            <strong>Rejection reason:</strong> {sheet.rejectionReason}
          </p>
        </Card>
      )}
      {sheet?.managerNotes && sheet.status === 'rework' && (
        <Card padding="sm" className="border-orange-200 bg-orange-50">
          <p className="text-sm text-orange-700">
            <strong>Manager notes:</strong> {sheet.managerNotes}
          </p>
        </Card>
      )}

      <div className="space-y-4">
        {goals.map((goal, index) => {
          const goalId = goal._id || `goal-${index}`;
          return (
            <Card key={goalId} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="section-title">Goal {index + 1}</h3>
                {canEdit && goals.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeGoal(index)} 
                    className="text-sm text-red-600 hover:text-red-700 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Input
                    label="Goal Title *"
                    value={goal.title}
                    onChange={(e) => updateGoal(index, 'title', e.target.value)}
                    disabled={!canEdit}
                    placeholder="Enter goal title (min 5 characters)"
                    error={goal.title && goal.title.length < 5 ? 'Title must be at least 5 characters' : ''}
                  />
                </div>
                <div className="md:col-span-2">
                  <Textarea
                    label="Description"
                    rows={2}
                    value={goal.description || ''}
                    onChange={(e) => updateGoal(index, 'description', e.target.value)}
                    disabled={!canEdit}
                    placeholder="Optional description (max 1000 characters)"
                  />
                </div>
                <div>
                  <Select
                    label="Thrust Area *"
                    value={goal.thrustArea}
                    onChange={(e) => updateGoal(index, 'thrustArea', e.target.value)}
                    disabled={!canEdit}
                    options={[{ value: '', label: 'Select thrust area' }, ...thrustAreas.map(t => ({ value: t, label: t }))]}
                  />
                </div>
                <div>
                  <Select
                    label="Unit of Measurement *"
                    value={goal.unitOfMeasurement}
                    onChange={(e) => updateGoal(index, 'unitOfMeasurement', e.target.value)}
                    disabled={!canEdit}
                    options={UNITS}
                  />
                </div>
                <div>
                  <Input
                    label="Target *"
                    type={goal.unitOfMeasurement === 'timeline' ? 'date' : 'number'}
                    value={goal.unitOfMeasurement === 'timeline' && goal.target
                      ? new Date(goal.target).toISOString().split('T')[0]
                      : goal.target}
                    onChange={(e) => {
                      const val = goal.unitOfMeasurement === 'timeline'
                        ? new Date(e.target.value).toISOString()
                        : e.target.value;
                      updateGoal(index, 'target', val);
                    }}
                    disabled={!canEdit}
                    placeholder={goal.unitOfMeasurement === 'timeline' ? 'Select deadline' : 'Enter target value'}
                  />
                </div>
                <div>
                  <Input
                    label={`Weightage % * (min ${MIN_WEIGHTAGE}%)`}
                    type="number"
                    min={MIN_WEIGHTAGE}
                    max={100}
                    value={goal.weightage}
                    onChange={(e) => updateGoal(index, 'weightage', Number(e.target.value))}
                    disabled={!canEdit}
                    placeholder="Enter weightage"
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {canEdit && (
        <div className="flex flex-wrap gap-3">
          {goals.length < MAX_GOALS && (
            <Button variant="secondary" onClick={addGoal}>
              + Add Goal
            </Button>
          )}
          <Button variant="secondary" onClick={handleSave} loading={saving}>
            Save Draft
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={saving} disabled={totalWeight !== REQUIRED_TOTAL}>
            Submit for Approval
          </Button>
        </div>
      )}
    </div>
  );
}

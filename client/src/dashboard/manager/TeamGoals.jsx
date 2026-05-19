import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { managerAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Button, Input, Select, Textarea, Card, Badge, Modal } from '../../components/ui';
import { formatLabel, QUARTERS } from '../../utils/validation';

export default function TeamGoals() {
  const year = new Date().getFullYear();
  const [quarter, setQuarter] = useState('Q1');
  const [filter, setFilter] = useState('');
  const [teamGoals, setTeamGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editGoals, setEditGoals] = useState([]);
  const [commentModal, setCommentModal] = useState(null);
  const [comment, setComment] = useState('');
  const [rejectModal, setRejectModal] = useState(null);
  const [reworkModal, setReworkModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reworkNotes, setReworkNotes] = useState('');

  const load = () => {
    setLoading(true);
    managerAPI
      .getTeamGoals({ year, quarter, status: filter || undefined })
      .then((res) => setTeamGoals(res.data.teamGoals || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, [year, quarter, filter]);

  const handleApprove = async (sheetId) => {
    try {
      await managerAPI.approve(sheetId);
      toast.success('Goals approved');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleReject = async (sheetId) => {
    setRejectModal(sheetId);
  };

  const confirmReject = async () => {
    if (!rejectModal || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      await managerAPI.reject(rejectModal, rejectionReason);
      toast.success('Goals rejected');
      setRejectModal(null);
      setRejectionReason('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleRework = async (sheetId) => {
    setReworkModal(sheetId);
  };

  const confirmRework = async () => {
    if (!reworkModal || !reworkNotes.trim()) {
      toast.error('Please provide notes for the employee');
      return;
    }
    try {
      await managerAPI.rework(reworkModal, reworkNotes);
      toast.success('Returned for rework');
      setReworkModal(null);
      setReworkNotes('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const startEdit = (sheet) => {
    setEditingId(sheet._id);
    setEditGoals(structuredClone(sheet.goals));
  };

  const saveEdit = async (sheetId) => {
    try {
      await managerAPI.editGoals(sheetId, editGoals);
      toast.success('Goals updated');
      setEditingId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const submitComment = async () => {
    if (!commentModal) return;
    try {
      await managerAPI.addComment(commentModal.sheetId, {
        goalId: commentModal.goalId,
        quarter,
        comment,
      });
      toast.success('Comment added');
      setCommentModal(null);
      setComment('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const getBadgeVariant = (status) => {
    if (status === 'approved') return 'success';
    if (status === 'rejected') return 'danger';
    if (status === 'submitted') return 'primary';
    if (status === 'rework') return 'warning';
    return 'default';
  };

  if (loading) return <LoadingSpinner className="py-20" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="page-title">Team Goals</h1>
        <div className="flex gap-3">
          <Select
            value={quarter}
            onChange={(e) => setQuarter(e.target.value)}
            options={QUARTERS.map((q) => ({ value: q, label: q }))}
            className="w-auto"
          />
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            options={[
              { value: '', label: 'All statuses' },
              { value: 'submitted', label: 'Submitted' },
              { value: 'approved', label: 'Approved' },
              { value: 'rework', label: 'Rework' },
            ]}
            className="w-auto"
          />
        </div>
      </div>

      {teamGoals.length === 0 ? (
        <Card padding="lg" className="text-center py-12 text-slate-500">
          No team goal sheets found.
        </Card>
      ) : (
        teamGoals.map((sheet) => (
          <Card key={sheet._id}>
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="section-title">{sheet.employee?.name}</h3>
                <p className="text-sm text-slate-500">{sheet.employee?.email} · {sheet.employee?.department}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={getBadgeVariant(sheet.status)}>{formatLabel(sheet.status)}</Badge>
                <span className="text-sm font-medium text-brand-600">
                  Progress: {sheet.actualProgress ?? 0}% (Planned: 100%)
                </span>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Goal</th>
                    <th>Target</th>
                    <th>Weight %</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {(editingId === sheet._id ? editGoals : sheet.goals).map((goal, i) => (
                    <tr key={goal._id || i}>
                      <td>{goal.title}</td>
                      <td>
                        {editingId === sheet._id ? (
                          <Input
                            className="w-24"
                            value={goal.target}
                            onChange={(e) => {
                              const updated = [...editGoals];
                              updated[i] = { ...updated[i], target: e.target.value };
                              setEditGoals(updated);
                            }}
                          />
                        ) : (
                          String(goal.target)
                        )}
                      </td>
                      <td>
                        {editingId === sheet._id ? (
                          <Input
                            className="w-20"
                            type="number"
                            value={goal.weightage}
                            onChange={(e) => {
                              const updated = [...editGoals];
                              updated[i] = { ...updated[i], weightage: Number(e.target.value) };
                              setEditGoals(updated);
                            }}
                          />
                        ) : (
                          `${goal.weightage}%`
                        )}
                      </td>
                      <td>{goal.computedProgress ?? 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {sheet.status === 'submitted' && (
                <>
                  <Button variant="primary" size="sm" onClick={() => handleApprove(sheet._id)}>
                    Approve
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleReject(sheet._id)}>
                    Reject
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => handleRework(sheet._id)}>
                    Return for Rework
                  </Button>
                  {editingId === sheet._id ? (
                    <>
                      <Button variant="primary" size="sm" onClick={() => saveEdit(sheet._id)}>Save Edits</Button>
                      <Button variant="secondary" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                    </>
                  ) : (
                    <Button variant="secondary" size="sm" onClick={() => startEdit(sheet)}>
                      Edit Targets
                    </Button>
                  )}
                </>
              )}
              {sheet.status === 'approved' &&
                sheet.goals.map((g) => (
                  <Button
                    key={g._id}
                    variant="secondary"
                    size="sm"
                    onClick={() => setCommentModal({ sheetId: sheet._id, goalId: g._id, title: g.title })}
                  >
                    Comment: {g.title.slice(0, 20)}...
                  </Button>
                ))}
            </div>
          </Card>
        ))
      )}

      <Modal
        isOpen={!!commentModal}
        onClose={() => setCommentModal(null)}
        title={`Check-in comment — ${commentModal?.title}`}
        size="sm"
      >
        <Textarea
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Quarterly check-in notes..."
        />
        <div className="mt-4 flex gap-2">
          <Button onClick={submitComment}>Save</Button>
          <Button variant="secondary" onClick={() => setCommentModal(null)}>Cancel</Button>
        </div>
      </Modal>

      <Modal
        isOpen={!!rejectModal}
        onClose={() => { setRejectModal(null); setRejectionReason(''); }}
        title="Reject Goals"
        size="sm"
      >
        <Textarea
          rows={4}
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="Please provide a reason for rejection..."
        />
        <div className="mt-4 flex gap-2">
          <Button variant="danger" onClick={confirmReject}>Reject</Button>
          <Button variant="secondary" onClick={() => { setRejectModal(null); setRejectionReason(''); }}>Cancel</Button>
        </div>
      </Modal>

      <Modal
        isOpen={!!reworkModal}
        onClose={() => { setReworkModal(null); setReworkNotes(''); }}
        title="Return for Rework"
        size="sm"
      >
        <Textarea
          rows={4}
          value={reworkNotes}
          onChange={(e) => setReworkNotes(e.target.value)}
          placeholder="Please provide notes for the employee..."
        />
        <div className="mt-4 flex gap-2">
          <Button variant="primary" onClick={confirmRework}>Return for Rework</Button>
          <Button variant="secondary" onClick={() => { setReworkModal(null); setReworkNotes(''); }}>Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Button, Input, Select, Card, Badge, Modal } from '../../components/ui';

const emptyUser = {
  name: '',
  email: '',
  password: '',
  role: 'employee',
  department: '',
  employeeId: '',
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyUser);
  const [deactivateModal, setDeactivateModal] = useState(null);

  const load = () => {
    adminAPI.getUsers().then((res) => setUsers(res.data.users)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createUser(form);
      toast.success('User created');
      setShowForm(false);
      setForm(emptyUser);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDeactivate = async (id) => {
    setDeactivateModal(id);
  };

  const confirmDeactivate = async () => {
    if (!deactivateModal) return;
    try {
      await adminAPI.deactivateUser(deactivateModal);
      toast.success('User deactivated');
      setDeactivateModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <LoadingSpinner className="py-20" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="page-title">Manage Users</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add User'}
        </Button>
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setForm(emptyUser); }}
        title="Create New User"
        size="lg"
      >
        <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            placeholder="Full name"
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            placeholder="email@company.com"
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Minimum 8 characters"
          />
          <Select
            label="Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            options={[
              { value: 'employee', label: 'Employee' },
              { value: 'manager', label: 'Manager' },
              { value: 'admin', label: 'Admin' },
            ]}
          />
          <Input
            label="Department"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            placeholder="e.g., Sales, Engineering"
          />
          <Input
            label="Employee ID"
            value={form.employeeId}
            onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
            placeholder="e.g., EMP001"
          />
          <Button type="submit" className="md:col-span-2">Create User</Button>
        </form>
      </Modal>

      <Card padding="sm" className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td className="font-medium">{u.name}</td>
                <td>{u.email}</td>
                <td className="capitalize">{u.role}</td>
                <td>{u.department}</td>
                <td>
                  <Badge variant={u.isActive ? 'success' : 'danger'}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td>
                  {u.isActive && u.role !== 'admin' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeactivate(u._id)}
                    >
                      Deactivate
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal
        isOpen={!!deactivateModal}
        onClose={() => setDeactivateModal(null)}
        title="Deactivate User"
        size="sm"
      >
        <p className="text-slate-600 mb-4">
          Are you sure you want to deactivate this user? They will no longer be able to access the system.
        </p>
        <div className="flex gap-2">
          <Button variant="danger" onClick={confirmDeactivate}>Deactivate</Button>
          <Button variant="secondary" onClick={() => setDeactivateModal(null)}>Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}

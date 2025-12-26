import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Shield, Loader } from 'lucide-react';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'viewer' | 'editor' | 'admin';
  createdAt: string;
}

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { isAdmin, token } = useAuth();

  useEffect(() => {
    if (isAdmin && token) {
      loadUsers();
    }
  }, [isAdmin, token]);

  const loadUsers = async () => {
    if (!token) return;

    try {
      const data = await apiClient.getUsers(token);
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'viewer' | 'editor' | 'admin') => {
    if (!token) return;

    setUpdating(userId);
    try {
      await apiClient.updateUserRole(token, userId, newRole);

      setUsers(users.map(u =>
        u.id === userId ? { ...u, role: newRole } : u
      ));
    } catch (error) {
      console.error('Error updating role:', error);
    } finally {
      setUpdating(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'editor':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 text-red-600">
          <Shield className="w-5 h-5" />
          <p>Admin access required</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold">User Management</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Joined</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">
                  {user.fullName || 'No name'}
                </td>
                <td className="py-3 px-4 text-gray-600">
                  {user.email}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600 text-sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user.id, e.target.value as 'viewer' | 'editor' | 'admin')}
                    disabled={updating === user.id}
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Users</p>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Editors</p>
          <p className="text-2xl font-bold text-blue-900">
            {users.filter(u => u.role === 'editor').length}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Admins</p>
          <p className="text-2xl font-bold text-red-900">
            {users.filter(u => u.role === 'admin').length}
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Admin, AdminPermissions } from '../../types';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Lock,
  UserCheck,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';
import { SuperAdminDeleteModal } from './SuperAdminDeleteModal';
import { SuperAdminNameModal } from './SuperAdminNameModal';

export const AdminManagementTab: React.FC = () => {
  const { admins, addAdmin, updateAdmin, deleteAdmin, currentUser, t } = useApp();

  const [isCreating, setIsCreating] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState<Admin | null>(null);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [permissions, setPermissions] = useState<AdminPermissions>({
    admissions: true,
    students: true,
    teachers: true,
    courses: true,
    groups: true,
    classes: true,
    fees: true,
    reports: true,
    settings: false,
    downloadRecordings: false,
  });

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setMobile('');
    setAdminPassword('admin123');
    setPermissions({
      admissions: true,
      students: true,
      teachers: true,
      courses: true,
      groups: true,
      classes: true,
      fees: true,
      reports: true,
      settings: false,
      downloadRecordings: false,
    });
    setIsCreating(false);
    setEditingAdmin(null);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !mobile) return;

    addAdmin({
      fullName,
      email: email.trim().toLowerCase(),
      mobile,
      permissions,
      status: 'active',
      initialPassword: adminPassword || 'admin123',
    });
    resetForm();
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;

    updateAdmin(editingAdmin.id, {
      fullName,
      email: email.trim().toLowerCase(),
      mobile,
      permissions,
      initialPassword: adminPassword || 'admin123',
    });
    resetForm();
  };

  const startEdit = (admin: Admin) => {
    setEditingAdmin(admin);
    setFullName(admin.fullName || admin.name || '');
    setEmail(admin.email);
    setMobile(admin.mobile || admin.phone || '');
    setAdminPassword((admin as any).initialPassword || 'admin123');
    setPermissions({
      downloadRecordings: false,
      ...admin.permissions,
    });
    setIsCreating(true);
  };

  const toggleStatus = (admin: Admin) => {
    updateAdmin(admin.id, {
      status: admin.status === 'active' ? 'inactive' : 'active',
    });
  };

  const permissionKeys: Array<{ key: keyof AdminPermissions; label: string }> = [
    { key: 'admissions', label: 'Admissions' },
    { key: 'students', label: 'Students' },
    { key: 'teachers', label: 'Teachers' },
    { key: 'courses', label: 'Courses' },
    { key: 'groups', label: 'Groups' },
    { key: 'classes', label: 'Classes' },
    { key: 'fees', label: 'Fees' },
    { key: 'reports', label: 'Reports' },
    { key: 'settings', label: 'Settings' },
    { key: 'downloadRecordings', label: 'Recordings Download (ڈاؤنلوڈ اجازت)' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Add Admin Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            <h3 className="text-xl font-bold text-slate-900">Admin Management</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Super Admin exclusive: Create administrative staff and configure granular role-based permissions.
          </p>
        </div>

        {!isCreating && (
          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsCreating(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors shadow-md shadow-purple-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Admin</span>
          </button>
        )}
      </div>

      {/* Super Admin Identity Box with Change Name Option */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-500/30 border border-purple-400/40 flex items-center justify-center text-purple-200">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                Super Admin Account
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30">
                Full System Control
              </span>
            </div>
            <h4 className="text-lg font-extrabold text-white mt-0.5">
              {currentUser?.name}
            </h4>
            <p className="text-xs text-purple-200">
              Email: {currentUser?.email || 'superadmin@kanzutajweed.com'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsNameModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-bold text-white transition-all shadow-xs"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Change Super Admin Name</span>
        </button>
      </div>

      {/* Create / Edit Form Modal/Panel */}
      {isCreating && (
        <form
          onSubmit={editingAdmin ? handleUpdate : handleCreate}
          className="bg-white p-6 rounded-2xl border-2 border-purple-200 shadow-lg space-y-5 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-bold text-slate-900 text-base">
              {editingAdmin ? 'Edit Administrator Details' : 'Create New Administrator'}
            </h4>
            <button
              type="button"
              onClick={resetForm}
              className="text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Hafiz Bilal Ahmed"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-purple-100 focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="bilal@kanzutajweed.com"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-purple-100 focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="9876543210"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-purple-100 focus:border-purple-600"
              />
            </div>
          </div>

          {/* Login Credentials Section */}
          <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-3.5">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-bold text-purple-900 text-xs">
                Admin Login Credentials / ایڈمن لاگ ان اسناد
              </span>
              <span className="text-[10px] text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full font-medium">
                Email = Login ID
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Login ID (ای میل لاگ ان آئی ڈی)
                </label>
                <div className="w-full p-2.5 rounded-lg border border-purple-200 bg-white text-slate-700 font-mono text-xs flex items-center justify-between">
                  <span className="truncate">{email.trim() || 'official.email@kanzutajweed.com'}</span>
                  <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded font-medium">Fixed to Email</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  ایڈمن کا لاگ ان آئی ڈی ان کی ای میل ہوگی (کوئی الگ یوزر آئی ڈی نہیں ہے)
                </p>
              </div>
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Initial Password / ابتدائی پاسورڈ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="e.g. admin123 or strong password"
                  className="w-full p-2.5 rounded-lg border border-purple-300 bg-white text-slate-900 font-mono text-xs focus:ring-2 focus:ring-purple-200"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  ایڈمن کے لیے ابتدائی پاسورڈ مقرر کریں (بعد میں تبدیل کیا جا سکتا ہے)
                </p>
              </div>
            </div>
          </div>

          {/* Granular Permissions Matrix */}
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-2">
              Assign Module Permissions:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {permissionKeys.map(({ key, label }) => {
                const isChecked = permissions[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      setPermissions((prev) => ({ ...prev, [key]: !prev[key] }))
                    }
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                      isChecked
                        ? 'bg-purple-50 border-purple-300 text-purple-900'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <span>{label}</span>
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${
                        isChecked ? 'bg-purple-600 text-white' : 'border border-slate-300'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs"
            >
              {editingAdmin ? 'Save Changes' : 'Create Administrator'}
            </button>
          </div>
        </form>
      )}

      {/* Admin List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 text-start">Administrator</th>
                <th className="py-3.5 px-4 text-start">Contact</th>
                <th className="py-3.5 px-4 text-start">Assigned Permissions</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center">
                        {(admin.fullName || admin.name || 'A')[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{admin.fullName || admin.name}</div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200">
                            Login ID: {admin.email}
                          </span>
                          <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                            Pass: {(admin as any).initialPassword || 'admin123'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    <div>{admin.email}</div>
                    <div className="text-[11px] text-slate-400">{admin.mobile || admin.phone}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {permissionKeys.map(({ key, label }) => {
                        if (!admin.permissions[key]) return null;
                        if (key === 'downloadRecordings') {
                          return (
                            <span
                              key={key}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1"
                            >
                              <Lock className="w-2.5 h-2.5" />
                              Download Permitted (ڈاؤنلوڈ مجاز)
                            </span>
                          );
                        }
                        return (
                          <span
                            key={key}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200"
                          >
                            {label}
                          </span>
                        );
                      })}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => toggleStatus(admin)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                        admin.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {admin.status === 'active' ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-slate-400" />
                          <span>Inactive</span>
                        </>
                      )}
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-end">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(admin)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Administrator"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingAdmin(admin)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Administrator"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Super Admin Delete Modal for Admin */}
      <SuperAdminDeleteModal
        isOpen={!!deletingAdmin}
        onClose={() => setDeletingAdmin(null)}
        entityType="admin"
        entity={deletingAdmin}
      />

      {/* Super Admin Name Modal */}
      <SuperAdminNameModal
        isOpen={isNameModalOpen}
        onClose={() => setIsNameModalOpen(false)}
      />
    </div>
  );
};

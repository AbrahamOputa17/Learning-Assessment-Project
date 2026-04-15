import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api';
import { Layout } from '../../components/layout/Layout';
import { Card, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', avatar: user?.avatar || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    setProfileLoading(true);
    try {
      const res = await authApi.updateProfile(profileForm);
      updateUser(res.data.data.user);
      setProfileMsg({ type: 'success', text: 'Profile updated!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setPwMsg({ type: '', text: '' });
    if (pwForm.newPassword.length < 8) {
      setPwMsg({ type: 'error', text: 'New password must be at least 8 characters' });
      return;
    }
    setPwLoading(true);
    try {
      await authApi.changePassword(pwForm);
      setPwMsg({ type: 'success', text: 'Password changed!' });
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

        {/* Profile info */}
        <Card>
          <CardBody className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-lg">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <p className="text-xs text-gray-400 capitalize mt-0.5">{user?.role}</p>
              </div>
            </div>
            <form onSubmit={handleProfile} className="space-y-4">
              {profileMsg.text && <Alert type={profileMsg.type}>{profileMsg.text}</Alert>}
              <Input
                id="name"
                label="Display Name"
                value={profileForm.name}
                onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
              <Input
                id="avatar"
                label="Avatar URL"
                value={profileForm.avatar}
                onChange={(e) => setProfileForm((f) => ({ ...f, avatar: e.target.value }))}
                placeholder="https://..."
              />
              <Button type="submit" loading={profileLoading}>Save Changes</Button>
            </form>
          </CardBody>
        </Card>

        {/* Change password */}
        <Card>
          <CardBody className="space-y-4">
            <h2 className="font-semibold text-gray-800">Change Password</h2>
            <form onSubmit={handlePassword} className="space-y-4">
              {pwMsg.text && <Alert type={pwMsg.type}>{pwMsg.text}</Alert>}
              <Input
                id="currentPassword"
                label="Current Password"
                type="password"
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
                required
                autoComplete="current-password"
              />
              <Input
                id="newPassword"
                label="New Password"
                type="password"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
                placeholder="Min. 8 characters"
                required
                autoComplete="new-password"
              />
              <Button type="submit" loading={pwLoading}>Change Password</Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </Layout>
  );
}

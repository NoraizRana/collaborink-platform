import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useWorkspaceStore } from '../store/workspaceStore';
import Layout from '../layouts/Layout';
import DashboardOverview from '../modules/dashboard/DashboardOverview';
import { Loader } from 'lucide-react';

export default function Dashboard() {
  const { user, token } = useAuthStore();
  const { workspaces, fetchWorkspaces, isLoading } = useWorkspaceStore();
  const navigate = useNavigate();
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/auth');
      return;
    }

    if (workspaces.length === 0) {
      fetchWorkspaces();
    }
  }, [token, navigate]);

  useEffect(() => {
    if (workspaces.length > 0 && !selectedWorkspace) {
      setSelectedWorkspace(workspaces[0]);
    }
  }, [workspaces]);

  if (isLoading || !selectedWorkspace) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <Loader className="animate-spin text-blue-600" size={40} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <DashboardOverview workspace={selectedWorkspace} />
    </Layout>
  );
}
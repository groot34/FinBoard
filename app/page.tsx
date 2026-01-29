'use client';

import { useState } from 'react';
import { Header } from '@/components/dashboard/Header';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { AddWidgetModal } from '@/components/dashboard/AddWidgetModal';
import { useDashboardStore } from '@/lib/store';

export default function Dashboard() {
  const [showAddModal, setShowAddModal] = useState(false);
  const widgets = useDashboardStore(state => state.widgets);

  return (
    <div className="min-h-screen bg-background">
      <Header onAddWidget={() => setShowAddModal(true)} />
      
      {widgets.length === 0 ? (
        <EmptyState onAddWidget={() => setShowAddModal(true)} />
      ) : (
        <DashboardGrid onAddWidget={() => setShowAddModal(true)} />
      )}

      <AddWidgetModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal} 
      />
    </div>
  );
}

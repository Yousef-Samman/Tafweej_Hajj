'use client';

import AlertsComponent from '@/components/AlertsComponent';
import { SafetyAlert } from '@/lib/supabase';
import NavBar from '@/components/NavBar';

export default function AlertsPage() {
  const handleAlertClick = (alert: SafetyAlert) => {
    // Admin-specific alert click handling
    console.log('Admin clicked alert:', alert);
    // You can add admin-specific actions here, like:
    // - Opening a modal to edit the alert
    // - Showing more detailed information
    // - Navigating to a specific location on the map
  };

  return (
    <>
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Safety Alerts</h1>
        <AlertsComponent isAdmin={true} onAlertClick={handleAlertClick} />
      </div>
    </>
  );
} 
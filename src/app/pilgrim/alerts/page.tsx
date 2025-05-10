'use client';

import AlertsComponent from '@/components/AlertsComponent';
import { SafetyAlert } from '@/lib/supabase';
import NavBar from '@/components/NavBar';

export default function PilgrimAlertsPage() {
  const handleAlertClick = (alert: SafetyAlert) => {
    // Pilgrim-specific alert click handling
    console.log('Pilgrim clicked alert:', alert);
    // You can add pilgrim-specific actions here, like:
    // - Showing directions to the location
    // - Displaying more detailed safety instructions
    // - Opening a modal with emergency contact information
  };

  return (
    <>
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Safety Alerts</h1>
        <AlertsComponent isAdmin={false} onAlertClick={handleAlertClick} />
      </div>
    </>
  );
} 
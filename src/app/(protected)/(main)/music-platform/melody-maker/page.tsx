"use client";

import { useEffect, useState } from "react";
import { PageLayout } from "~/components/client/music-platform/page-layout";
import { type ClientHistoryItem } from "~/lib/history";
import { MelodyMakerEditor } from "~/components/client/music-platform/melody-maker/melody-maker-editor";
import { useAuth } from "~/contexts/AuthContext";

export default function MelodyMakerPage() {
  const service = "melody-maker";
  const { user } = useAuth();
  const userId = user?.id;
  
  const [historyItems, setHistoryItems] = useState<ClientHistoryItem[]>([]);
  const [credits, setCredits] = useState(1000); // Default value, you might want to fetch this

  const fetchHistoryItems = async () => {
    if (!userId) return;

    try {
      // Since we're in a client component, we need to use an API route
      // to fetch history items instead of calling the database directly
      const response = await fetch(`/api/history?service=${service}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const items = await response.json();
        setHistoryItems(items);
      } else {
        console.error('Failed to fetch history items:', response.status);
        setHistoryItems([]); // Fallback to empty array
      }
    } catch (error) {
      console.error('Error fetching history items:', error);
      setHistoryItems([]); // Fallback to empty array
    }
  };

  useEffect(() => {
    fetchHistoryItems();
  }, [userId, service]);

  // Don't render the editor if user is not authenticated
  if (!userId) {
    return (
      <PageLayout
        title={"Melody Maker"}
        service={service}
        showSidebar={true}
        historyItems={[]}
      >
        <div className="flex h-full items-center justify-center">
          <p>Loading user data...</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={"Melody Maker"}
      service={service}
      showSidebar={true}
      historyItems={historyItems}
    >
      <MelodyMakerEditor 
        service="melody-maker" 
        credits={credits} 
        userId={userId} 
        onHistoryUpdate={fetchHistoryItems}
      />
    </PageLayout>
  );
}
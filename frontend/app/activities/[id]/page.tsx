"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import ActivityDetailPageNew from "@/components/ActivityDetailPageNew";
import type { Activity, Destination } from "@/components/ActivityDetailPageNew";

type BackendEnvelope<T> = {
  success?: boolean;
  status?: string;
  message?: string;
  data?: T;
};

function isSuccessPayload<T>(payload: BackendEnvelope<T>): boolean {
  return payload.success === true || payload.status === "success";
}

export default function Page() {
  const params = useParams<{ id: string }>();
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const activityId = (rawId ?? "").trim();

  const [activity, setActivity] = useState<Activity | null>(null);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activityId) {
      setError("Invalid activity id.");
      setLoading(false);
      return;
    }

    let mounted = true;

    const loadActivity = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/activities/get_one.php?id=${encodeURIComponent(activityId)}`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as BackendEnvelope<Activity>;

        if (!response.ok || !isSuccessPayload(payload) || !payload.data) {
          throw new Error(payload.message ?? "Failed to load activity details.");
        }

        if (!mounted) {
          return;
        }

        const activityData = payload.data;
        setActivity(activityData);

        // Fetch destination if destination_id exists
        if (activityData.destination_id) {
          try {
            const destResponse = await fetch(
              `${API_BASE_URL}/destinations/${encodeURIComponent(String(activityData.destination_id))}`,
              { cache: "no-store" }
            );
            const destPayload = (await destResponse.json()) as BackendEnvelope<Destination>;
            if (isSuccessPayload(destPayload) && destPayload.data && mounted) {
              setDestination(destPayload.data);
            }
          } catch (err) {
            // Silently fail - destination is optional
            console.log("Could not load destination:", err);
          }
        }
      } catch (fetchError) {
        if (!mounted) {
          return;
        }

        const message = fetchError instanceof Error ? fetchError.message : "Failed to load activity details.";
        setError(message);
        setActivity(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadActivity();

    return () => {
      mounted = false;
    };
  }, [activityId]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#080501",
        color: "#F5E6B5",
      }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 18, marginBottom: 16, fontFamily: "'Cormorant Garamond', serif" }}>Loading activity...</p>
          <div style={{
            width: 40, height: 40,
            border: "2px solid rgba(212,175,55,0.2)",
            borderTop: "2px solid #D4AF37",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto",
          }} />
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#080501",
        color: "#F5E6B5",
        padding: 24,
      }}>
        <div style={{
          borderRadius: 16,
          border: "1px solid rgba(255,100,100,0.3)",
          background: "rgba(255,100,100,0.1)",
          padding: 24,
          maxWidth: 400,
          textAlign: "center",
        }}>
          <p style={{ fontSize: 16, color: "#FF6464", fontFamily: "'Cormorant Garamond', serif" }}>{error}</p>
        </div>
      </div>
    );
  }

  return <ActivityDetailPageNew activity={activity} destination={destination} />;
}

const DEFAULT_API_BASE_URL = "http://localhost/Egypt_panorama/backend/api";

function readEnv(name: string): string | undefined {
  const fromNext =
    typeof process !== "undefined" && process.env
      ? (process.env[name] as string | undefined)
      : undefined;

  const fromVite =
    typeof import.meta !== "undefined"
      ? ((import.meta as unknown as { env?: Record<string, string | undefined> }).env?.[name] as
          | string
          | undefined)
      : undefined;

  return fromNext ?? fromVite;
}

export const API_BASE_URL = (
  readEnv("NEXT_PUBLIC_BACKEND_API_BASE_URL") ??
  readEnv("VITE_BACKEND_API_BASE_URL") ??
  DEFAULT_API_BASE_URL
).replace(/\/+$/, "");

export const API_ENDPOINTS = {
  destinations: "/destinations/get_all.php",
  destinationCreate: "/destinations/create.php",
  destinationUpdate: "/destinations/update.php",
  destinationDelete: "/destinations/delete.php",
  activities: "/activities.php",
  activitiesGetAll: "/activities/get_all.php",
  activityCreate: "/activities/create.php",
  activityUpdate: "/activities/update.php",
  activityDelete: "/activities/delete.php",
  companies: "/companies/get_all.php",
  tourismDestinations: "/tourism-destinations.php",
  activityReviewsGet: "/activity-reviews/get.php",
  activityReviewsAdd: "/activity-reviews/add.php",
  adminStats: "/api/admin/stats",
  adminActivities: "/api/admin/activities",
  adminUsers: "/api/admin/users",
} as const;

type ApiEnvelope<T> = {
  success?: boolean;
  status?: "success" | "error" | string;
  message?: string;
  data?: T;
};

function toApiUrl(endpoint: string): string {
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }

  if (endpoint.startsWith("/api/")) {
    return endpoint;
  }

  const normalized = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${normalized}`;
}

export async function apiFetch<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const response = await fetch(toApiUrl(endpoint), {
    cache: "no-store",
    ...init,
  });

  let payload: ApiEnvelope<T> | null = null;

  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    throw new Error("Invalid server response.");
  }

  if (!response.ok) {
    throw new Error(payload?.message ?? `Request failed with status ${response.status}.`);
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("Malformed API response.");
  }

  if (payload.status === "error" || payload.success === false) {
    throw new Error(payload.message ?? "Request failed.");
  }

  if (payload.data === undefined) {
    throw new Error("API response does not include data.");
  }

  return payload.data;
}

export interface ApiDestination {
  id: number | string;
  name: string;
  city?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  type?: string;
  cover_image?: string | null;
  gallery_images?: string | null;
}

export interface ApiActivity {
  id: number | string;
  name: string;
  type: string;
  tourism_type?: string;
  category?: string;
  destination_id: number | string;
  destination_name?: string;
  rating?: number | string;
  price?: string;
  image_url?: string | null;
  is_hidden?: number | string | boolean;
  latitude?: number | string | null;
  longitude?: number | string | null;
  status?: string;
}

export interface ApiAdminStats {
  activityCount: number;
  userCount: number;
  destCount: number;
  companyCount: number;
}

export interface ApiAdminUser {
  id: number | string;
  name: string;
  email: string;
  country?: string;
  role: string;
  joined?: string;
}

export interface ApiCompany {
  company_id?: number | string;
  id?: number | string;
  comp_name?: string;
  name?: string;
  city?: string;
  rating?: number | string;
  description?: string;
  comp_phone?: string;
  comp_email?: string;
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { API_ENDPOINTS, apiFetch, type ApiActivity, type ApiDestination } from "@/lib/api";

type Section = "activities" | "destinations";
type Mode = "create" | "edit";

type MessageState = {
	type: "success" | "error";
	text: string;
};

type ActivityFormState = {
	id?: number;
	name: string;
	type: string;
	category: string;
	destination_id: string;
	rating: string;
	price: string;
	image_url: string;
	is_hidden: boolean;
};

type DestinationFormState = {
	id?: number;
	name: string;
	city: string;
	latitude: string;
	longitude: string;
	type: string;
	cover_image: string;
	gallery_images: string;
};

const DESTINATION_TYPES = ["Cultural", "Desert", "Sea & Diving", "Eco & Wellness"];

const ACTIVITY_CATEGORIES = ["Cultural", "Desert", "Sea & Diving", "Eco & Wellness", "Adventure", "Leisure"];

function toNumberString(value: number | string | null | undefined): string {
	if (value === null || value === undefined) {
		return "";
	}

	return String(value);
}

function isHiddenValue(value: ApiActivity["is_hidden"]): boolean {
	return value === true || value === 1 || value === "1" || value === "true";
}

function toActivityFormState(activity: ApiActivity | null = null): ActivityFormState {
	return {
		id: activity ? Number(activity.id) : undefined,
		name: activity?.name ?? "",
		type: activity?.type ?? "Activity",
		category: activity?.category ?? "Cultural",
		destination_id: activity ? String(activity.destination_id) : "",
		rating: activity?.rating !== undefined ? String(activity.rating) : "4.0",
		price: activity?.price ?? "N/A",
		image_url: activity?.image_url ?? "",
		is_hidden: Boolean(activity?.is_hidden),
	};
}

function toDestinationFormState(destination: ApiDestination | null = null): DestinationFormState {
	return {
		id: destination ? Number(destination.id) : undefined,
		name: destination?.name ?? "",
		city: destination?.city ?? "Egypt",
		latitude: toNumberString(destination?.latitude),
		longitude: toNumberString(destination?.longitude),
		type: destination?.type ?? "Cultural",
		cover_image: destination?.cover_image ?? "",
		gallery_images: destination?.gallery_images ?? "",
	};
}

function formatCoordinates(latitude?: number | string | null, longitude?: number | string | null): string {
	if (latitude === null || latitude === undefined || longitude === null || longitude === undefined || latitude === "" || longitude === "") {
		return "Not set";
	}

	return `${latitude}, ${longitude}`;
}

function ActivityModal({
	mode,
	open,
	value,
	destinations,
	onChange,
	onClose,
	onSubmit,
	busy,
	}: {
	mode: Mode;
	open: boolean;
	value: ActivityFormState;
	destinations: ApiDestination[];
	onChange: (next: ActivityFormState) => void;
	onClose: () => void;
	onSubmit: () => void;
	busy: boolean;
}) {
	if (!open) {
		return null;
	}

	const categoryOptions = value.category && !ACTIVITY_CATEGORIES.includes(value.category)
		? [value.category, ...ACTIVITY_CATEGORIES]
		: ACTIVITY_CATEGORIES;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 px-4 py-8 backdrop-blur-sm">
			<div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-[28px] border border-white/15 bg-[#120f0a] p-5 text-stone-100 shadow-[0_30px_90px_rgba(0,0,0,0.45)] md:p-6">
				<div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
					<div>
						<p className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">Activities</p>
						<h3 className="mt-1 text-2xl font-black text-white">
							{mode === "create" ? "Add Activity" : "Edit Activity"}
						</h3>
					</div>
					<button type="button" onClick={onClose} className="rounded-full border border-white/15 px-3 py-1 text-sm text-stone-300 transition hover:bg-white/10">
						Close
					</button>
				</div>

				<div className="mt-5 grid gap-4 md:grid-cols-2">
					<label className="grid gap-2 text-sm">
						<span className="text-stone-300">Name</span>
						<input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none ring-0 focus:border-amber-400" value={value.name} onChange={(event) => onChange({ ...value, name: event.target.value })} />
					</label>
					<label className="grid gap-2 text-sm">
						<span className="text-stone-300">Type</span>
						<input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none ring-0 focus:border-amber-400" value={value.type} onChange={(event) => onChange({ ...value, type: event.target.value })} />
					</label>
					<label className="grid gap-2 text-sm">
						<span className="text-stone-300">Category</span>
						<select className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-400" value={value.category} onChange={(event) => onChange({ ...value, category: event.target.value })}>
							{categoryOptions.map((category) => (
								<option key={category} value={category}>{category}</option>
							))}
						</select>
					</label>
					<label className="grid gap-2 text-sm">
						<span className="text-stone-300">Destination</span>
						<select className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-400" value={value.destination_id} onChange={(event) => onChange({ ...value, destination_id: event.target.value })}>
							<option value="">Select a destination</option>
							{destinations.map((destination) => (
								<option key={destination.id} value={destination.id}>{destination.name}</option>
							))}
						</select>
					</label>
					<label className="grid gap-2 text-sm">
						<span className="text-stone-300">Rating</span>
						<input type="number" min="0" max="5" step="0.1" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-400" value={value.rating} onChange={(event) => onChange({ ...value, rating: event.target.value })} />
					</label>
					<label className="grid gap-2 text-sm">
						<span className="text-stone-300">Price</span>
						<input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-400" value={value.price} onChange={(event) => onChange({ ...value, price: event.target.value })} />
					</label>
					<label className="grid gap-2 text-sm md:col-span-2">
						<span className="text-stone-300">Image URL</span>
						<input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none ring-0 focus:border-amber-400" value={value.image_url} onChange={(event) => onChange({ ...value, image_url: event.target.value })} placeholder="https://... or /images/..." />
					</label>
				</div>

				<label className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-stone-200">
					<input type="checkbox" checked={value.is_hidden} onChange={(event) => onChange({ ...value, is_hidden: event.target.checked })} />
					<span>Hidden from public listings</span>
				</label>

				<div className="mt-6 flex flex-wrap justify-end gap-3">
					<button type="button" onClick={onClose} className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-bold text-stone-300 transition hover:bg-white/10">Cancel</button>
						<button type="button" onClick={onSubmit} disabled={busy} className="rounded-full bg-linear-to-r from-amber-400 to-orange-500 px-5 py-2.5 text-sm font-black text-stone-950 transition hover:from-amber-300 hover:to-orange-400 disabled:cursor-not-allowed disabled:opacity-60">
						{busy ? "Saving..." : mode === "create" ? "Create Activity" : "Save Changes"}
					</button>
				</div>
			</div>
		</div>
	);
}

function DestinationModal({
	mode,
	open,
	value,
	onChange,
	onClose,
	onSubmit,
	busy,
	}: {
	mode: Mode;
	open: boolean;
	value: DestinationFormState;
	onChange: (next: DestinationFormState) => void;
	onClose: () => void;
	onSubmit: () => void;
	busy: boolean;
}) {
	if (!open) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 px-4 py-8 backdrop-blur-sm">
			<div className="max-h-[90vh] w-full max-w-xl overflow-auto rounded-[28px] border border-white/15 bg-[#120f0a] p-5 text-stone-100 shadow-[0_30px_90px_rgba(0,0,0,0.45)] md:p-6">
				<div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
					<div>
						<p className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">Destinations</p>
						<h3 className="mt-1 text-2xl font-black text-white">
							{mode === "create" ? "Add Destination" : "Edit Destination"}
						</h3>
					</div>
					<button type="button" onClick={onClose} className="rounded-full border border-white/15 px-3 py-1 text-sm text-stone-300 transition hover:bg-white/10">
						Close
					</button>
				</div>

				<div className="mt-5 grid gap-4 md:grid-cols-2">
					<label className="grid gap-2 text-sm md:col-span-2">
						<span className="text-stone-300">Name</span>
						<input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-400" value={value.name} onChange={(event) => onChange({ ...value, name: event.target.value })} />
					</label>
					<label className="grid gap-2 text-sm">
						<span className="text-stone-300">City</span>
						<input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-400" value={value.city} onChange={(event) => onChange({ ...value, city: event.target.value })} />
					</label>
					<label className="grid gap-2 text-sm">
						<span className="text-stone-300">Latitude</span>
						<input type="number" step="0.000001" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-400" value={value.latitude} onChange={(event) => onChange({ ...value, latitude: event.target.value })} />
					</label>
					<label className="grid gap-2 text-sm">
						<span className="text-stone-300">Type</span>
						<select className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-400" value={value.type} onChange={(event) => onChange({ ...value, type: event.target.value })}>
							{DESTINATION_TYPES.map((type) => (
								<option key={type} value={type}>{type}</option>
							))}
						</select>
					</label>
					<label className="grid gap-2 text-sm">
						<span className="text-stone-300">Longitude</span>
						<input type="number" step="0.000001" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-400" value={value.longitude} onChange={(event) => onChange({ ...value, longitude: event.target.value })} />
					</label>
					<label className="grid gap-2 text-sm md:col-span-2">
						<span className="text-stone-300">Cover Image URL</span>
						<input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-400" value={value.cover_image} onChange={(event) => onChange({ ...value, cover_image: event.target.value })} placeholder="https://... or /images/..." />
					</label>
					<label className="grid gap-2 text-sm md:col-span-2">
						<span className="text-stone-300">Gallery Images</span>
						<textarea className="min-h-24 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-400" value={value.gallery_images} onChange={(event) => onChange({ ...value, gallery_images: event.target.value })} placeholder="JSON array or comma-separated URLs" />
					</label>
				</div>

				<div className="mt-6 flex flex-wrap justify-end gap-3">
					<button type="button" onClick={onClose} className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-bold text-stone-300 transition hover:bg-white/10">Cancel</button>
						<button type="button" onClick={onSubmit} disabled={busy} className="rounded-full bg-linear-to-r from-amber-400 to-orange-500 px-5 py-2.5 text-sm font-black text-stone-950 transition hover:from-amber-300 hover:to-orange-400 disabled:cursor-not-allowed disabled:opacity-60">
						{busy ? "Saving..." : mode === "create" ? "Create Destination" : "Save Changes"}
					</button>
				</div>
			</div>
		</div>
	);
}

export default function AdminEntityManager() {
	const [section, setSection] = useState<Section>("activities");
	const [activities, setActivities] = useState<ApiActivity[]>([]);
	const [destinations, setDestinations] = useState<ApiDestination[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [busyDeleteId, setBusyDeleteId] = useState<number | null>(null);
	const [search, setSearch] = useState("");
	const [message, setMessage] = useState<MessageState | null>(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [mode, setMode] = useState<Mode>("create");
	const [activityForm, setActivityForm] = useState<ActivityFormState>(toActivityFormState());
	const [destinationForm, setDestinationForm] = useState<DestinationFormState>(toDestinationFormState());

	const loadData = async () => {
		setLoading(true);
		try {
			const [activityData, destinationData] = await Promise.all([
				apiFetch<ApiActivity[]>(API_ENDPOINTS.activities),
				apiFetch<ApiDestination[]>(API_ENDPOINTS.destinations),
			]);

			setActivities(activityData ?? []);
			setDestinations(destinationData ?? []);
		} catch (error) {
			setMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to load admin data." });
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void loadData();
	}, []);

	const visibleActivities = useMemo(() => {
		const query = search.trim().toLowerCase();
		return activities.filter((activity) => {
			if (!query) return true;
			return [activity.name, activity.type, activity.category ?? "", activity.destination_name].join(" ").toLowerCase().includes(query);
		});
	}, [activities, search]);

	const visibleDestinations = useMemo(() => {
		const query = search.trim().toLowerCase();
		return destinations.filter((destination) => {
			if (!query) return true;
			return [destination.name, destination.city ?? "", destination.type ?? ""].join(" ").toLowerCase().includes(query);
		});
	}, [destinations, search]);

	const activeCount = section === "activities" ? visibleActivities.length : visibleDestinations.length;

	const openCreateModal = () => {
		setMode("create");
		setModalOpen(true);
		setMessage(null);
		if (section === "activities") {
			setActivityForm(toActivityFormState());
			return;
		}

		setDestinationForm(toDestinationFormState());
	};

	const openEditModal = (item: ApiActivity | ApiDestination) => {
		setMode("edit");
		setModalOpen(true);
		setMessage(null);

		if (section === "activities") {
			setActivityForm(toActivityFormState(item as ApiActivity));
			return;
		}

		setDestinationForm(toDestinationFormState(item as ApiDestination));
	};

	const closeModal = () => {
		if (saving) {
			return;
		}

		setModalOpen(false);
	};

	const saveCurrent = async () => {
		setSaving(true);
		setMessage(null);

		try {
			if (section === "activities") {
				if (!activityForm.name.trim() || !activityForm.type.trim() || !activityForm.category.trim() || !activityForm.destination_id) {
					throw new Error("All activity fields are required.");
				}

				const payload = {
					...activityForm,
					destination_id: Number(activityForm.destination_id),
					rating: Number(activityForm.rating),
					is_hidden: activityForm.is_hidden ? 1 : 0,
					image_url: activityForm.image_url.trim() === "" ? null : activityForm.image_url.trim(),
				};

				if (mode === "create") {
					await apiFetch(API_ENDPOINTS.activityCreate, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(payload),
					});
				} else {
					await apiFetch(API_ENDPOINTS.activityUpdate, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ ...payload, id: activityForm.id }),
					});
				}
			} else {
				if (!destinationForm.name.trim()) {
					throw new Error("Destination name is required.");
				}

				const payload = {
					...destinationForm,
					latitude: destinationForm.latitude === "" ? null : Number(destinationForm.latitude),
					longitude: destinationForm.longitude === "" ? null : Number(destinationForm.longitude),
					type: destinationForm.type.trim() === "" ? "Cultural" : destinationForm.type.trim(),
					cover_image: destinationForm.cover_image.trim() === "" ? null : destinationForm.cover_image.trim(),
					gallery_images: destinationForm.gallery_images.trim() === "" ? null : destinationForm.gallery_images.trim(),
				};

				if (mode === "create") {
					await apiFetch(API_ENDPOINTS.destinationCreate, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(payload),
					});
				} else {
					await apiFetch(API_ENDPOINTS.destinationUpdate, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ ...payload, id: destinationForm.id }),
					});
				}
			}

			setModalOpen(false);
			await loadData();
			setMessage({ type: "success", text: `${section === "activities" ? "Activity" : "Destination"} saved successfully.` });
		} catch (error) {
			setMessage({ type: "error", text: error instanceof Error ? error.message : "Save failed." });
		} finally {
			setSaving(false);
		}
	};

	const deleteItem = async (item: ApiActivity | ApiDestination) => {
		const singularLabel = section === "activities" ? "activity" : "destination";

		if (!window.confirm(`Delete this ${singularLabel}? This cannot be undone.`)) {
			return;
		}

		const id = Number(item.id);
		setBusyDeleteId(id);
		setMessage(null);

		try {
			if (section === "activities") {
				await apiFetch(API_ENDPOINTS.activityDelete, {
					method: "DELETE",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ id }),
				});
			} else {
				await apiFetch(API_ENDPOINTS.destinationDelete, {
					method: "DELETE",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ id }),
				});
			}

			await loadData();
			setMessage({ type: "success", text: `${section === "activities" ? "Activity" : "Destination"} deleted successfully.` });
		} catch (error) {
			setMessage({ type: "error", text: error instanceof Error ? error.message : "Delete failed." });
		} finally {
			setBusyDeleteId(null);
		}
	};

	return (
		<section className="space-y-6">
			<div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
				<div className="rounded-[28px] border border-white/15 bg-white/80 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.12)] backdrop-blur">
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div className="space-y-2">
							<p className="text-xs font-black uppercase tracking-[0.24em] text-(--admin-primary)">Content Control</p>
							<h2 className="text-2xl font-black text-stone-950 md:text-3xl">Activities and Destinations</h2>
							<p className="max-w-2xl text-sm leading-6 text-stone-600">Manage the shared content source used across the map, destination pages, and activity listings. Changes are written directly to MySQL.</p>
						</div>
						<button type="button" onClick={openCreateModal} className="rounded-full bg-stone-950 px-5 py-2.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-stone-800">
							Add {section === "activities" ? "Activity" : "Destination"}
						</button>
					</div>

					<div className="mt-5 flex flex-wrap gap-2">
						{(["activities", "destinations"] as Section[]).map((nextSection) => (
							<button
								key={nextSection}
								type="button"
								onClick={() => setSection(nextSection)}
								className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
									section === nextSection
										? "border-amber-500 bg-amber-100 text-amber-900"
										: "border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
								}`}
							>
								{nextSection === "activities" ? "Activities" : "Destinations"}
							</button>
						))}
					</div>
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<div className="rounded-3xl border border-white/15 bg-[#12100c] p-5 text-white shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
						<p className="text-xs font-black uppercase tracking-[0.22em] text-amber-300">Loaded</p>
						<p className="mt-2 text-3xl font-black">{loading ? "..." : activeCount}</p>
						<p className="mt-2 text-sm text-white/65">{section === "activities" ? "Visible activities matching your search." : "Visible destinations matching your search."}</p>
					</div>
					<div className="rounded-3xl border border-white/15 bg-[#1c140d] p-5 text-white shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
						<p className="text-xs font-black uppercase tracking-[0.22em] text-orange-200">Sync</p>
						<p className="mt-2 text-3xl font-black">Live</p>
						<p className="mt-2 text-sm text-white/65">Edits update the backend immediately and will appear in the map and public views on reload.</p>
					</div>
				</div>
			</div>

			<div className="rounded-[28px] border border-white/15 bg-white/85 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.12)] backdrop-blur">
				<div className="flex flex-col gap-4 border-b border-stone-200 pb-4 md:flex-row md:items-center md:justify-between">
					<div>
						<p className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">{section === "activities" ? "Activity Library" : "Destination Library"}</p>
						<h3 className="mt-1 text-xl font-black text-stone-950">{section === "activities" ? "Manage activities" : "Manage destinations"}</h3>
					</div>
					<div className="flex flex-1 flex-wrap items-center gap-3 md:max-w-xl md:justify-end">
						<input
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder={section === "activities" ? "Search activity, type, category, destination" : "Search destination or city"}
							className="min-w-0 flex-1 rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-amber-400"
						/>
						<button type="button" onClick={() => void loadData()} className="rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm font-bold text-stone-700 transition hover:bg-stone-50">
							Refresh
						</button>
					</div>
				</div>

				{message ? (
					<div className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-medium ${message.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}>
						{message.text}
					</div>
				) : null}

				{loading ? (
					<div className="grid gap-3 py-8 text-center text-sm text-stone-500">
						<p>Loading data from the backend...</p>
					</div>
				) : section === "activities" ? (
					<div className="overflow-x-auto">
						<table className="min-w-full text-left text-sm">
							<thead className="bg-stone-100 text-xs uppercase tracking-[0.11em] text-stone-500">
								<tr>
									<th className="px-4 py-3">Activity</th>
									<th className="px-4 py-3">Destination</th>
									<th className="px-4 py-3">Category</th>
									<th className="px-4 py-3">Rating</th>
									<th className="px-4 py-3">Price</th>
									<th className="px-4 py-3">Status</th>
									<th className="px-4 py-3 text-right">Actions</th>
								</tr>
							</thead>
							<tbody>
								{visibleActivities.length === 0 ? (
									<tr>
										<td className="px-4 py-8 text-stone-500" colSpan={7}>No activities match your search.</td>
									</tr>
								) : (
									visibleActivities.map((activity) => (
										<tr key={activity.id} className="border-t border-stone-200/80 bg-white">
											<td className="px-4 py-4 align-top">
												<p className="font-bold text-stone-950">{activity.name}</p>
												<p className="mt-1 text-xs text-stone-500">{activity.type}</p>
											</td>
											<td className="px-4 py-4 align-top text-stone-700">{activity.destination_name}</td>
											<td className="px-4 py-4 align-top text-stone-700">{activity.category ?? "Cultural"}</td>
											<td className="px-4 py-4 align-top text-stone-700">{Number(activity.rating ?? 0).toFixed(1)}</td>
											<td className="px-4 py-4 align-top text-stone-700">{activity.price ?? "N/A"}</td>
											<td className="px-4 py-4 align-top">
												<span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${isHiddenValue(activity.is_hidden) ? "border-stone-300 bg-stone-100 text-stone-700" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
													{isHiddenValue(activity.is_hidden) ? "Hidden" : "Visible"}
												</span>
											</td>
											<td className="px-4 py-4 align-top text-right">
												<div className="inline-flex gap-2">
													<button type="button" onClick={() => openEditModal(activity)} className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 transition hover:bg-stone-50">Edit</button>
													<button type="button" onClick={() => void deleteItem(activity)} disabled={busyDeleteId === Number(activity.id)} className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60">
														{busyDeleteId === Number(activity.id) ? "Deleting..." : "Delete"}
													</button>
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full text-left text-sm">
							<thead className="bg-stone-100 text-xs uppercase tracking-[0.11em] text-stone-500">
								<tr>
									<th className="px-4 py-3">Destination</th>
									<th className="px-4 py-3">City</th>
									<th className="px-4 py-3">Type</th>
									<th className="px-4 py-3">Coordinates</th>
									<th className="px-4 py-3 text-right">Actions</th>
								</tr>
							</thead>
							<tbody>
								{visibleDestinations.length === 0 ? (
									<tr>
										<td className="px-4 py-8 text-stone-500" colSpan={5}>No destinations match your search.</td>
									</tr>
								) : (
									visibleDestinations.map((destination) => (
										<tr key={destination.id} className="border-t border-stone-200/80 bg-white">
											<td className="px-4 py-4 align-top font-bold text-stone-950">{destination.name}</td>
											<td className="px-4 py-4 align-top text-stone-700">{destination.city ?? "Egypt"}</td>
											<td className="px-4 py-4 align-top text-stone-700">{destination.type ?? "Cultural"}</td>
											<td className="px-4 py-4 align-top text-stone-700">{formatCoordinates(destination.latitude, destination.longitude)}</td>
											<td className="px-4 py-4 align-top text-right">
												<div className="inline-flex gap-2">
													<button type="button" onClick={() => openEditModal(destination)} className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 transition hover:bg-stone-50">Edit</button>
													<button type="button" onClick={() => void deleteItem(destination)} disabled={busyDeleteId === Number(destination.id)} className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60">
														{busyDeleteId === Number(destination.id) ? "Deleting..." : "Delete"}
													</button>
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				)}
			</div>

			<ActivityModal
				mode={mode}
				open={modalOpen && section === "activities"}
				value={activityForm}
				destinations={destinations}
				onChange={setActivityForm}
				onClose={closeModal}
				onSubmit={() => void saveCurrent()}
				busy={saving}
			/>

			<DestinationModal
				mode={mode}
				open={modalOpen && section === "destinations"}
				value={destinationForm}
				onChange={setDestinationForm}
				onClose={closeModal}
				onSubmit={() => void saveCurrent()}
				busy={saving}
			/>
		</section>
	);
}
"use client";

import L, { type DivIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import type { PlaceCategory, PlaceItem } from "./page";

type MapComponentProps = {
  places: PlaceItem[];
  selectedPlaceId: number | null;
  onSelectPlace: (id: number) => void;
};

const egyptCenter: [number, number] = [26.8206, 30.8025];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function markerMeta(category: PlaceCategory): { color: string; glyph: string } {
  if (category === "Cultural") {
    return { color: "#f59e0b", glyph: "🏛️" };
  }

  if (category === "Adventure") {
    return { color: "#ef4444", glyph: "🏜️" };
  }

  return { color: "#06b6d4", glyph: "🌊" };
}

function markerIcon(category: PlaceCategory, isSelected: boolean): DivIcon {
  const config = markerMeta(category);

  return L.divIcon({
    className: "",
    html: `
      <div class="map-marker-shell ${isSelected ? "is-selected" : ""}">
        <div class="map-marker-dot" style="--marker-color:${config.color}">
          <span>${config.glyph}</span>
        </div>
      </div>
    `,
    iconSize: isSelected ? [44, 44] : [36, 36],
    iconAnchor: isSelected ? [22, 22] : [18, 18],
    popupAnchor: [0, -16],
  });
}

function clusterIcon(count: number): DivIcon {
  const size = count < 10 ? 42 : count < 40 ? 52 : 64;
  const tone = count < 10 ? "low" : count < 40 ? "mid" : "high";

  return L.divIcon({
    className: "",
    html: `
      <div class="map-cluster map-cluster-${tone}" style="width:${size}px;height:${size}px;">
        <span>${count}</span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function placePopupHtml(place: PlaceItem): string {
  const rating = typeof place.rating === "number" ? place.rating.toFixed(1) : null;
  const metricsHtml =
    place.source === "activity"
      ? `
      <div class="map-popup-grid">
        <div>
          <small>Rating</small>
          <strong>${rating ?? "N/A"} ★</strong>
        </div>
        <div>
          <small>Price</small>
          <strong>${escapeHtml(place.price ?? "N/A")}</strong>
        </div>
      </div>
    `
      : `
      <div class="map-popup-grid map-popup-grid-single">
        <div>
          <small>Type</small>
          <strong>${escapeHtml("Destination")}</strong>
        </div>
      </div>
    `;

  return `
    <div class="map-popup-card">
      <div class="map-popup-header">
        <h3>${escapeHtml(place.name)}</h3>
        <span>${escapeHtml(place.category)}</span>
      </div>
      <p class="map-popup-subtitle">${escapeHtml(place.destinationName)}</p>
      <div class="map-popup-grid">
        <div>
          <small>Category</small>
          <strong>${escapeHtml(place.category)}</strong>
        </div>
        <div>
          <small>Type</small>
          <strong>${escapeHtml(place.source === "destination" ? "Destination" : "Activity")}</strong>
        </div>
      </div>
      ${metricsHtml}
      <button type="button" data-view-details="true">View Details</button>
    </div>
  `;
}

function FlyToSelection({ places, selectedPlaceId }: { places: PlaceItem[]; selectedPlaceId: number | null }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedPlaceId) {
      return;
    }

    const selected = places.find((place) => place.id === selectedPlaceId);
    if (!selected) {
      return;
    }

    map.flyTo([selected.latitude, selected.longitude], Math.max(9, map.getZoom()), {
      duration: 1.1,
      easeLinearity: 0.2,
    });
  }, [map, places, selectedPlaceId]);

  return null;
}

function ClusterLayer({
  places,
  selectedPlaceId,
  onSelectPlace,
}: {
  places: PlaceItem[];
  selectedPlaceId: number | null;
  onSelectPlace: (id: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const leafletWithCluster = L as typeof L & {
      markerClusterGroup: (options?: Record<string, unknown>) => any;
    };

    const clusterGroup = leafletWithCluster.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 52,
      animate: true,
      animateAddingMarkers: true,
      spiderfyOnEveryZoom: false,
      zoomToBoundsOnClick: true,
      showCoverageOnHover: false,
      iconCreateFunction: (cluster: { getChildCount: () => number }) => clusterIcon(cluster.getChildCount()),
    });

    places.forEach((place) => {
      const isSelected = place.id === selectedPlaceId;
      const marker = L.marker([place.latitude, place.longitude], {
        icon: markerIcon(place.category, isSelected),
        riseOnHover: true,
      });

      marker.on("click", () => onSelectPlace(place.id));

      marker.bindPopup(placePopupHtml(place), {
        closeButton: true,
        autoPan: true,
        className: "place-popup-shell",
      });

      marker.on("popupopen", (event) => {
        const popupElement = event.popup.getElement();
        const button = popupElement?.querySelector<HTMLButtonElement>('[data-view-details="true"]');

        if (!button) {
          return;
        }

        const handleClick = () => onSelectPlace(place.id);
        button.addEventListener("click", handleClick, { once: true });
      });

      clusterGroup.addLayer(marker);
    });

    clusterGroup.on("clusterclick", (event: { layer: { getBounds: () => L.LatLngBounds } }) => {
      map.flyToBounds(event.layer.getBounds(), {
        padding: [36, 36],
        duration: 0.9,
      });
    });

    map.addLayer(clusterGroup);

    return () => {
      map.removeLayer(clusterGroup);
    };
  }, [map, onSelectPlace, places, selectedPlaceId]);

  return null;
}

export default function MapComponent({ places, selectedPlaceId, onSelectPlace }: MapComponentProps) {
  return (
    <MapContainer
      center={egyptCenter}
      zoom={6}
      minZoom={5}
      maxZoom={16}
      scrollWheelZoom
      zoomControl={false}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      <ClusterLayer places={places} selectedPlaceId={selectedPlaceId} onSelectPlace={onSelectPlace} />

      <FlyToSelection places={places} selectedPlaceId={selectedPlaceId} />
    </MapContainer>
  );
}

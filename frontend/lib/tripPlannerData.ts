export interface PlannerActivity {
  id: number;
  name: string;
  location: string;
  type: "historical" | "museum" | "relax" | "adventure";
  lat: number;
  lng: number;
  price: number;
}

export interface PlannerDestination {
  id: number;
  name: string;
  type: string;
}

export const activities: PlannerActivity[] = [
  {
    id: 1,
    name: "Pyramids",
    location: "Cairo",
    type: "historical",
    lat: 29.9792,
    lng: 31.1342,
    price: 20,
  },
  {
    id: 2,
    name: "Egyptian Museum",
    location: "Cairo",
    type: "museum",
    lat: 30.0478,
    lng: 31.2336,
    price: 15,
  },
  {
    id: 3,
    name: "Nile Cruise",
    location: "Cairo",
    type: "relax",
    lat: 30.0444,
    lng: 31.2357,
    price: 50,
  },
  {
    id: 4,
    name: "Safari",
    location: "Luxor",
    type: "adventure",
    lat: 25.6872,
    lng: 32.6396,
    price: 40,
  },
];

export const destinations: PlannerDestination[] = [
  { id: 1, name: "Cairo", type: "Historical" },
  { id: 2, name: "Luxor", type: "Cultural" },
];

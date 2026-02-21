// ── Enums ──────────────────────────────────────────────────

export type UnitSystem = 'imperial' | 'metric';

export type TripStatus = 'draft' | 'planned' | 'active' | 'completed';

export type WaypointType =
  | 'trailhead'
  | 'campsite'
  | 'water_source'
  | 'summit'
  | 'hazard'
  | 'poi'
  | 'resupply';

export type GearCategory =
  | 'shelter'
  | 'sleep'
  | 'cook'
  | 'clothing'
  | 'safety'
  | 'navigation'
  | 'hygiene'
  | 'other';

export type ConditionSource = 'NWS' | 'USGS' | 'recreation_gov';

// ── Entity Types ───────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  skill_level: string | null;
  preferred_units: UnitSystem;
  created_at: string;
}

export interface Trip {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: TripStatus;
  start_date: string | null;
  end_date: string | null;
  region: string | null;
  cover_image_url: string | null;
  is_public: boolean;
  route_geojson: Record<string, unknown> | null;
  created_at: string;
}

export interface Day {
  id: string;
  trip_id: string;
  day_number: number;
  date: string | null;
  notes: string | null;
  start_waypoint_id: string | null;
  end_waypoint_id: string | null;
  target_miles: number | null;
  elevation_gain: number | null;
  elevation_loss: number | null;
}

export interface Waypoint {
  id: string;
  trip_id: string;
  day_id: string | null;
  name: string;
  description: string | null;
  type: WaypointType;
  lat: number;
  lng: number;
  elevation: number | null;
  mile_marker: number | null;
  sort_order: number;
  notes: string | null;
}

export interface GearItem {
  id: string;
  trip_id: string;
  user_id: string;
  name: string;
  category: GearCategory;
  weight_oz: number;
  quantity: number;
  is_worn: boolean;
  is_packed: boolean;
}

export interface Conditions {
  id: string;
  trip_id: string;
  waypoint_id: string | null;
  source: ConditionSource;
  data: Record<string, unknown>;
  fetched_at: string;
  expires_at: string;
}

// ── Gear Templates ─────────────────────────────────────────

export interface GearTemplateItem {
  name: string;
  category: GearCategory;
  weight_oz: number;
  quantity: number;
}

export interface GearTemplate {
  id: string;
  name: string;
  description: string | null;
  items: GearTemplateItem[];
  created_at: string;
}

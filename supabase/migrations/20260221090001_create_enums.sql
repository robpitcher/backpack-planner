-- TrailForge MVP: Custom enum types
-- All enums referenced by the data model in specs/mvp.md

CREATE TYPE unit_preference AS ENUM ('imperial', 'metric');

CREATE TYPE trip_status AS ENUM ('draft', 'planned', 'active', 'completed');

CREATE TYPE waypoint_type AS ENUM (
  'trailhead', 'campsite', 'water_source', 'summit',
  'hazard', 'poi', 'resupply'
);

CREATE TYPE gear_category AS ENUM (
  'shelter', 'sleep', 'cook', 'clothing',
  'safety', 'navigation', 'hygiene', 'other'
);

CREATE TYPE condition_source AS ENUM ('NWS', 'USGS', 'recreation_gov');

CREATE TYPE recommendation_type AS ENUM ('itinerary', 'gear', 'safety', 'general');

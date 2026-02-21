-- TrailForge MVP: Core tables
-- All values stored in imperial units (miles, feet, oz). Conversion is client-side.

-- ============================================================
-- Users (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  display_name TEXT,
  avatar_url  TEXT,
  skill_level TEXT,
  preferred_units unit_preference NOT NULL DEFAULT 'imperial',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON public.users (email);

-- ============================================================
-- Trips
-- ============================================================
CREATE TABLE public.trips (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  status          trip_status NOT NULL DEFAULT 'draft',
  start_date      DATE,
  end_date        DATE,
  region          TEXT,
  cover_image_url TEXT,
  is_public       BOOLEAN NOT NULL DEFAULT false,
  route_geojson   JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_trips_user_id ON public.trips (user_id);
CREATE INDEX idx_trips_status ON public.trips (status);
CREATE INDEX idx_trips_is_public ON public.trips (is_public) WHERE is_public = true;

-- ============================================================
-- Days
-- ============================================================
CREATE TABLE public.days (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id           UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  day_number        INTEGER NOT NULL,
  date              DATE,
  notes             TEXT,
  start_waypoint_id UUID,  -- FK added after waypoints table exists
  end_waypoint_id   UUID,  -- FK added after waypoints table exists
  target_miles      NUMERIC(6,2),
  elevation_gain    NUMERIC(8,1),
  elevation_loss    NUMERIC(8,1),
  UNIQUE (trip_id, day_number)
);

CREATE INDEX idx_days_trip_id ON public.days (trip_id);

-- ============================================================
-- Waypoints
-- ============================================================
CREATE TABLE public.waypoints (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id     UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  day_id      UUID REFERENCES public.days(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  description TEXT,
  type        waypoint_type NOT NULL,
  lat         DOUBLE PRECISION NOT NULL,
  lng         DOUBLE PRECISION NOT NULL,
  elevation   NUMERIC(8,1),
  mile_marker NUMERIC(6,2),
  sort_order  INTEGER NOT NULL DEFAULT 0,
  notes       TEXT
);

CREATE INDEX idx_waypoints_trip_id ON public.waypoints (trip_id);
CREATE INDEX idx_waypoints_day_id ON public.waypoints (day_id);

-- Now add the deferred FKs from days → waypoints
ALTER TABLE public.days
  ADD CONSTRAINT fk_days_start_waypoint
    FOREIGN KEY (start_waypoint_id) REFERENCES public.waypoints(id) ON DELETE SET NULL;

ALTER TABLE public.days
  ADD CONSTRAINT fk_days_end_waypoint
    FOREIGN KEY (end_waypoint_id) REFERENCES public.waypoints(id) ON DELETE SET NULL;

-- ============================================================
-- Gear Items
-- ============================================================
CREATE TABLE public.gear_items (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id   UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name      TEXT NOT NULL,
  category  gear_category NOT NULL,
  weight_oz NUMERIC(7,2),
  quantity  INTEGER NOT NULL DEFAULT 1,
  is_worn   BOOLEAN NOT NULL DEFAULT false,
  is_packed BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_gear_items_trip_id ON public.gear_items (trip_id);
CREATE INDEX idx_gear_items_user_id ON public.gear_items (user_id);

-- ============================================================
-- Conditions (cached external data)
-- ============================================================
CREATE TABLE public.conditions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id     UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  waypoint_id UUID REFERENCES public.waypoints(id) ON DELETE SET NULL,
  source      condition_source NOT NULL,
  data        JSONB NOT NULL DEFAULT '{}',
  fetched_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_conditions_trip_id ON public.conditions (trip_id);
CREATE INDEX idx_conditions_waypoint_id ON public.conditions (waypoint_id);

-- ============================================================
-- Recommendations (future AI layer)
-- ============================================================
CREATE TABLE public.recommendations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id    UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  type       recommendation_type NOT NULL,
  prompt     TEXT,
  response   TEXT,
  model      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_recommendations_trip_id ON public.recommendations (trip_id);

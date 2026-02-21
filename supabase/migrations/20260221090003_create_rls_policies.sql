-- TrailForge MVP: Row-Level Security policies
-- All tables scoped to authenticated user via auth.uid()

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
ALTER TABLE public.users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.days            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waypoints       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gear_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conditions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Users: own row only
-- ============================================================
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- Trips: owner full access; anyone can view public trips
-- ============================================================
CREATE POLICY "Users can manage own trips"
  ON public.trips FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public trips"
  ON public.trips FOR SELECT
  USING (is_public = true);

-- ============================================================
-- Days: access via trip ownership
-- ============================================================
CREATE POLICY "Users can manage days on own trips"
  ON public.days FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = days.trip_id
        AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view days on public trips"
  ON public.days FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = days.trip_id
        AND trips.is_public = true
    )
  );

-- ============================================================
-- Waypoints: access via trip ownership
-- ============================================================
CREATE POLICY "Users can manage waypoints on own trips"
  ON public.waypoints FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = waypoints.trip_id
        AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view waypoints on public trips"
  ON public.waypoints FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = waypoints.trip_id
        AND trips.is_public = true
    )
  );

-- ============================================================
-- Gear Items: owner only (no public view for gear)
-- ============================================================
CREATE POLICY "Users can manage own gear items"
  ON public.gear_items FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- Conditions: access via trip ownership; public trip viewers can read
-- ============================================================
CREATE POLICY "Users can manage conditions on own trips"
  ON public.conditions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = conditions.trip_id
        AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view conditions on public trips"
  ON public.conditions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = conditions.trip_id
        AND trips.is_public = true
    )
  );

-- ============================================================
-- Recommendations: owner only
-- ============================================================
CREATE POLICY "Users can manage own recommendations"
  ON public.recommendations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = recommendations.trip_id
        AND trips.user_id = auth.uid()
    )
  );

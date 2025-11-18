// Shared TypeScript types for the monorepo

export interface User {
  id: string;
  email: string;
  name: string | null;
  created_at: Date;
}

export interface Race {
  id: string;
  slug: string;
  name: string;
  state_code: string;
  district: string | null;
  race_type: 'president' | 'senate' | 'house' | 'governor';
  election_date: Date;
  is_active: boolean;
}

export interface Poll {
  id: string;
  race_id: string;
  pollster_id: string;
  sample_size: number;
  population: 'LV' | 'RV' | 'A';
  methodology: 'Phone' | 'Online' | 'IVR' | 'Mixed';
  field_date: Date;
  publish_date: Date | null;
  margin_of_error: number | null;
  url: string | null;
}

export interface Forecast {
  id: string;
  race_id: string;
  forecast_type: 'monte_carlo' | 'fundamentals' | 'hybrid';
  win_probability: Record<string, number>;
  simulations: number;
  last_updated: Date;
}

export interface Pollster {
  id: string;
  name: string;
  slug: string;
  rating: string | null;
  methodology_score: number | null;
  historical_accuracy: number | null;
  bias_score: number | null;
  primary_methodology: 'Phone' | 'Online' | 'IVR' | 'Mixed' | null;
  aapor_member: boolean;
  partisan: 'Nonpartisan' | 'Democratic' | 'Republican' | null;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

// Frontend-specific types
export interface RaceWithPolls extends Race {
  polls: Poll[];
  forecast: Forecast | null;
  poll_count: number;
}

export interface PollWithDetails extends Poll {
  pollster: Pollster;
  race: {
    id: string;
    name: string;
    state_code: string;
  };
}

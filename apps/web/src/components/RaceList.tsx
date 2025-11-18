'use client';

import { trpc } from '@/lib/trpc';
import Link from 'next/link';

interface RaceListProps {
  limit?: number;
  state?: string;
  type?: 'president' | 'senate' | 'house' | 'governor';
}

export function RaceList({ limit = 10, state, type }: RaceListProps) {
  const { data: races, isLoading, error } = trpc.race.list.useQuery({
    limit,
    state,
    type,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Error loading races: {error.message}
      </div>
    );
  }

  if (!races || races.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No races found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {races.map((race) => (
        <Link
          key={race.id}
          href={`/races/${race.id}`}
          className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 group"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors">
                {race.name}
              </h3>
              <p className="text-sm text-gray-500">{race.state_code} • {race.race_type}</p>
            </div>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              {race.poll_count} polls
            </span>
          </div>

          {race.forecast && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Win Probability</span>
                <span className="text-sm text-gray-500">
                  {Math.max(
                    race.forecast.win_probability.D || 0,
                    race.forecast.win_probability.R || 0
                  ).toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600"
                  style={{ width: `${(race.forecast.win_probability.D || 0) * 100}%` }}
                />
              </div>
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}

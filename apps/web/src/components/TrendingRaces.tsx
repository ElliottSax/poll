'use client';

import { trpc } from '@/lib/trpc';
import Link from 'next/link';

export function TrendingRaces() {
  const { data: trending, isLoading } = trpc.race.trending.useQuery({
    limit: 5,
  });

  if (isLoading) {
    return <div className="animate-pulse">Loading trending races...</div>;
  }

  if (!trending || trending.length === 0) {
    return <div>No trending races at the moment</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {trending.map((race, index) => (
        <Link
          key={race.race_id}
          href={`/races/${race.race_id}`}
          className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b last:border-b-0"
        >
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-gray-300">#{index + 1}</span>
            <div>
              <h4 className="font-semibold">{race.race_name}</h4>
              <p className="text-sm text-gray-500">
                {race.movement_direction.replace('_', ' ')} • {race.polls_last_7d} new polls
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-600">
              {race.movement_7d > 0 ? '+' : ''}{race.movement_7d.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">{race.category_change}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}

'use client'

import { useState } from 'react'

export function RaceFilters() {
  const [filters, setFilters] = useState({
    year: '2024',
    office: 'all',
    state: 'all',
  })

  const offices = ['All', 'President', 'Senate', 'House', 'Governor']
  const states = ['All', 'AZ', 'GA', 'MI', 'NV', 'NC', 'PA', 'WI']

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sticky top-4">
      <h3 className="font-bold text-gray-900 mb-4">Filters</h3>

      {/* Year Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Year
        </label>
        <select
          value={filters.year}
          onChange={(e) => setFilters({ ...filters, year: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="2024">2024</option>
          <option value="2022">2022</option>
          <option value="2020">2020</option>
        </select>
      </div>

      {/* Office Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Office
        </label>
        <select
          value={filters.office}
          onChange={(e) => setFilters({ ...filters, office: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {offices.map((office) => (
            <option key={office} value={office.toLowerCase()}>
              {office}
            </option>
          ))}
        </select>
      </div>

      {/* State Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          State
        </label>
        <select
          value={filters.state}
          onChange={(e) => setFilters({ ...filters, state: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {states.map((state) => (
            <option key={state} value={state.toLowerCase()}>
              {state}
            </option>
          ))}
        </select>
      </div>

      {/* Reset Filters */}
      <button
        onClick={() => setFilters({ year: '2024', office: 'all', state: 'all' })}
        className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
      >
        Reset Filters
      </button>
    </div>
  )
}

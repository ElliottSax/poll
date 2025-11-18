'use client'

import { useState } from 'react'

export function PollsterFilters() {
  const [filters, setFilters] = useState({
    grade: 'all',
    partisan: 'all',
  })

  const grades = ['All', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C']
  const partisanOptions = ['All', 'Non-partisan', 'Democratic', 'Republican']

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sticky top-4">
      <h3 className="font-bold text-gray-900 mb-4">Filters</h3>

      {/* Grade Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Grade
        </label>
        <select
          value={filters.grade}
          onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {grades.map((grade) => (
            <option key={grade} value={grade.toLowerCase()}>
              {grade}
            </option>
          ))}
        </select>
      </div>

      {/* Partisan Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Affiliation
        </label>
        <select
          value={filters.partisan}
          onChange={(e) => setFilters({ ...filters, partisan: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {partisanOptions.map((option) => (
            <option key={option} value={option.toLowerCase()}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* Reset Filters */}
      <button
        onClick={() => setFilters({ grade: 'all', partisan: 'all' })}
        className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
      >
        Reset Filters
      </button>
    </div>
  )
}

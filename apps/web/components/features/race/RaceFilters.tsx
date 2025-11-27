'use client'

import { useState } from 'react'
import { Search, Filter, X, ChevronDown } from 'lucide-react'

const raceTypes = [
  { value: 'all', label: 'All Races' },
  { value: 'presidential', label: 'Presidential' },
  { value: 'senate', label: 'Senate' },
  { value: 'house', label: 'House' },
  { value: 'governor', label: 'Governor' },
]

const raceStatuses = [
  { value: 'all', label: 'All Statuses' },
  { value: 'safe-d', label: 'Safe D' },
  { value: 'likely-d', label: 'Likely D' },
  { value: 'lean-d', label: 'Lean D' },
  { value: 'toss-up', label: 'Toss-up' },
  { value: 'lean-r', label: 'Lean R' },
  { value: 'likely-r', label: 'Likely R' },
  { value: 'safe-r', label: 'Safe R' },
]

export function RaceFilters() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState(0)

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedType('all')
    setSelectedStatus('all')
    setActiveFilters(0)
  }

  const applyFilters = () => {
    let count = 0
    if (selectedType !== 'all') count++
    if (selectedStatus !== 'all') count++
    if (searchQuery) count++
    setActiveFilters(count)
    setIsFilterOpen(false)
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search races by state, candidate, or office..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 glass border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="relative glass border border-border/50 px-6 py-3 rounded-xl hover:border-primary/50 transition-all duration-300 font-semibold flex items-center gap-2 group"
        >
          <Filter className="h-4 w-4 group-hover:scale-110 transition-transform" />
          <span>Filters</span>
          {activeFilters > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse-glow">
              {activeFilters}
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Filter Panel */}
      <div
        className={`
          overflow-hidden transition-all duration-500 ease-in-out
          ${isFilterOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="glass border border-border/50 rounded-xl p-6 space-y-6 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Race Type Filter */}
            <div>
              <label className="block text-sm font-semibold mb-3">Race Type</label>
              <div className="space-y-2">
                {raceTypes.map((type) => (
                  <label
                    key={type.value}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-all duration-200 group"
                  >
                    <input
                      type="radio"
                      name="raceType"
                      value={type.value}
                      checked={selectedType === type.value}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary/50 cursor-pointer"
                    />
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">
                      {type.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Race Status Filter */}
            <div>
              <label className="block text-sm font-semibold mb-3">Race Rating</label>
              <div className="space-y-2">
                {raceStatuses.map((status) => (
                  <label
                    key={status.value}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-all duration-200 group"
                  >
                    <input
                      type="radio"
                      name="raceStatus"
                      value={status.value}
                      checked={selectedStatus === status.value}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary/50 cursor-pointer"
                    />
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">
                      {status.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-border/30">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear All
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => setIsFilterOpen(false)}
                className="px-6 py-2 border border-border rounded-lg hover:bg-accent transition-all duration-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={applyFilters}
                className="px-6 py-2 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-lg hover:shadow-glow transition-all duration-300 font-semibold"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilters > 0 && (
        <div className="flex flex-wrap items-center gap-2 animate-slide-up">
          <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
          {selectedType !== 'all' && (
            <FilterChip
              label={raceTypes.find((t) => t.value === selectedType)?.label || ''}
              onRemove={() => setSelectedType('all')}
            />
          )}
          {selectedStatus !== 'all' && (
            <FilterChip
              label={raceStatuses.find((s) => s.value === selectedStatus)?.label || ''}
              onRemove={() => setSelectedStatus('all')}
            />
          )}
          {searchQuery && (
            <FilterChip label={`Search: "${searchQuery}"`} onRemove={() => setSearchQuery('')} />
          )}
          <button
            onClick={handleClearFilters}
            className="text-xs text-primary hover:underline font-medium ml-2"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div className="inline-flex items-center gap-2 glass border border-primary/30 px-3 py-1.5 rounded-full text-sm font-medium group hover:border-primary/50 transition-all duration-300">
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}

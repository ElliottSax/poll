/**
 * Google Analytics 4 integration
 */

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID!, {
      page_path: url,
    })
  }
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Custom events for polling dashboard
export const analytics = {
  // Race interactions
  viewRace: (raceName: string) => {
    event({
      action: 'view_race',
      category: 'Race',
      label: raceName,
    })
  },

  viewPoll: (pollster: string, raceName: string) => {
    event({
      action: 'view_poll',
      category: 'Poll',
      label: `${pollster} - ${raceName}`,
    })
  },

  viewForecast: (raceType: string) => {
    event({
      action: 'view_forecast',
      category: 'Forecast',
      label: raceType,
    })
  },

  // Pollster interactions
  viewPollster: (pollsterName: string) => {
    event({
      action: 'view_pollster',
      category: 'Pollster',
      label: pollsterName,
    })
  },

  // Chart interactions
  interactChart: (chartType: string) => {
    event({
      action: 'interact_chart',
      category: 'Chart',
      label: chartType,
    })
  },

  // Filter usage
  useFilter: (filterType: string, filterValue: string) => {
    event({
      action: 'use_filter',
      category: 'Filter',
      label: `${filterType}: ${filterValue}`,
    })
  },

  // Share actions
  shareRace: (raceName: string, platform: string) => {
    event({
      action: 'share',
      category: 'Social',
      label: `${platform} - ${raceName}`,
    })
  },

  // Search
  search: (query: string) => {
    event({
      action: 'search',
      category: 'Search',
      label: query,
    })
  },

  // Theme toggle
  toggleTheme: (theme: string) => {
    event({
      action: 'toggle_theme',
      category: 'Preference',
      label: theme,
    })
  },
}

// Type declaration for gtag
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event',
      targetId: string,
      config?: Record<string, any>
    ) => void
  }
}

# Feature: Translation Analytics Dashboard

## Overview
The Translation Analytics Dashboard is a comprehensive visualization tool that provides insights into translation activities. It helps users understand their translation patterns, language preferences, and usage trends over time. The dashboard is built with React 19, Tailwind v4, and Shadcn UI components, featuring responsive charts and metrics cards.

## Implementation Details

### Data Model
The feature uses the following TypeScript data models (defined in `src/features/translation-analytics/types.ts`):

```typescript
export interface LanguagePair {
  source: string;
  target: string;
  count: number;
}

export interface TranslationMetric {
  label: string;
  value: number;
  change?: number; // percentage change from previous period
}

export interface TimeSeriesData {
  date: string;
  count: number;
}

export interface LanguageUsage {
  language: string;
  count: number;
  percentage: number;
}

export interface TranslationAnalytics {
  totalTranslations: TranslationMetric;
  completedTranslations: TranslationMetric;
  failedTranslations: TranslationMetric;
  averageProcessingTime: TranslationMetric;
  languagePairs: LanguagePair[];
  timeSeriesData: TimeSeriesData[];
  sourceLanguages: LanguageUsage[];
  targetLanguages: LanguageUsage[];
}
```

### Hooks
The feature uses custom hooks for data processing (located in `src/features/translation-analytics/hooks/`):

**Data Processing:**
- `useTranslationAnalytics(history)`: Processes translation history data to generate analytics metrics and visualizations. The hook calculates:
  - Total, completed, and failed translations
  - Average processing time
  - Language pair usage
  - Time series data for trend analysis
  - Source and target language distributions
  - Period-over-period changes

### Components
The feature includes the following components (located in `src/features/translation-analytics/components/`), built with Shadcn UI and styled with Tailwind v4:

1. **TranslationAnalyticsPage**: Main dashboard view.
   - Layout for the entire analytics dashboard
   - Handles data fetching and provides empty state handling
   - Integrates all visualization components

2. **MetricCard**: Reusable card for displaying key metrics.
   - Shows metric label, value, and change percentage
   - Visual indicators for positive/negative changes
   - Support for custom formatting and icons

3. **TimeSeriesChart**: Bar chart showing translation activity over time.
   - Interactive time-based visualization
   - Tooltip with detailed information on hover
   - Responsive design that adapts to container width

4. **LanguagePairsChart**: Bar chart showing most popular language pairs.
   - Horizontal bars with relative scaling
   - Clear labeling of source and target languages
   - Limited to top 5 pairs for clarity

5. **LanguageDistributionChart**: Donut chart showing language distribution.
   - Visualizes the distribution of source or target languages
   - Color-coded segments with legend
   - Shows percentage for each language

### State Management
- **Local UI State**: Managed with `useState` for UI interactions like date range selection.
- **Data Processing**: Uses `useMemo` for efficient computation of analytics from history data.
- **Translation History Data**: Leverages the existing `useTranslationHistory` hook from the translation history feature.

### User Flows
1. **Accessing Analytics**
   - User navigates to the analytics page from either:
     - The homepage "Analytics" card
     - The "View Analytics" button in the Translation History page
   - The dashboard loads with all-time analytics by default

2. **Interacting with Visualizations**
   - User can hover over chart elements to see detailed information
   - Time series chart shows activity trends
   - Language distribution charts reveal language preferences
   - Metrics cards show key performance indicators

3. **Filtering Analytics (Future Enhancement)**
   - User can select predefined date ranges (7d, 30d, 90d)
   - Date range selector allows custom period selection

### Performance Considerations
- All chart calculations are optimized with `useMemo` to prevent unnecessary recalculations
- SVG-based visualizations for efficient rendering
- Limited data points displayed in charts to maintain performance
- Responsive design that works well on mobile and desktop

### Accessibility Features
- Semantic HTML structure throughout
- Color contrast ratios that meet WCAG standards
- Interactive elements have appropriate focus states
- Chart information available through tooltips and alternative text
- Keyboard navigation support for all interactive elements

### Future Improvements
- Add export functionality for analytics data (CSV, PDF)
- Implement time range filtering for more granular analysis
- Add more advanced visualizations (heatmaps, correlation charts)
- Create custom analytics based on user preferences
- Add real-time updates for active translations

### Integration with Existing Features
The Translation Analytics Dashboard integrates with:
1. **Translation History**: Uses the same data source via the `useTranslationHistory` hook
2. **Homepage**: Featured as a new capability on the homepage
3. **Navigation Flow**: Accessible from the Translation History page

### Technical Implementation Notes
- Custom SVG-based charts rather than a heavy charting library
- Responsive design works on mobile through desktop
- Consistent use of Tailwind's utility classes and Shadcn UI components
- Performance optimized with proper React hooks usage 
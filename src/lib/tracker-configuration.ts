export enum TrackingLevel {
  /**
   * Track dom mutation events.
   */
  MUTATION,
  /**
   * Track user interactions (clicks, keyboard events, drag & drop events).
   */
  INTERACTION,
  /**
   * Track all events whose target is marked.
   */
  MARKED,
}

export interface TrackerConfiguration {
  /**
   * @property identifier: string
   * Defines the tracker identifier. Usefull when using several trackers.
   */
  identifier?: string;

  /**
   * @property level: TrackingLevel
   * Defines the type of events that should be tracked.
   */
  level?: TrackingLevel;

  /**
   * @property events: string[]
   * Defines the event the tracker will listen to.
   */
  events?: string[];
}

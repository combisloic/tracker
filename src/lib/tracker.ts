import { EventEmitter } from 'events';
import { TrackerConfiguration, TrackingLevel } from './tracker-configuration';
import { TrackerError } from './tracker-error';
import { TrackerEvent } from './tracker-event';

import * as parse from 'url-parse';
import { UAParser } from 'ua-parser-js';

type Status = 'READY' | 'RUNNING' | 'PAUSED' | 'STOPPED';

export class Tracker extends EventEmitter {
  private configuration: TrackerConfiguration;

  private isPaused: boolean;

  private status: Status;

  private mutationObserver: MutationObserver | undefined;

  private uaParser = new UAParser();

  private readonly STARTED_STATUSES: Status[] = ['RUNNING', 'PAUSED'];
  private readonly STOPPED_STATUSES: Status[] = ['READY', 'STOPPED'];

  private constructor(config: TrackerConfiguration) {
    super();

    this.configuration = {
      level: config.level ?? TrackingLevel.MARKED,
      events: config.events ?? [
        'click',
        'dblclick',
        'contextmenu',
        'select',
        'wheel',
        'keypress',
        'drag',
        'drop',
        'play',
        'pause',
      ],
    };

    this.isPaused = false;
    this.status = 'READY';
  }

  static init(config: TrackerConfiguration): Tracker {
    return new Tracker(config);
  }

  ready(): boolean {
    return this.status === 'READY';
  }

  running(): boolean {
    return this.status === 'RUNNING';
  }

  paused(): boolean {
    return this.status === 'PAUSED';
  }

  stopped(): boolean {
    return this.status === 'STOPPED';
  }

  /**
   * Start recording DOM events/mutation.
   */
  start(): void {
    if (!document) {
      console.warn('[TRACKER]: document is not available.');
    }

    if (this.STARTED_STATUSES.includes(this.status)) {
      throw new Error(TrackerError.CANNOT_TRACK_STARTED);
    }

    if (this.configuration.level === TrackingLevel.MUTATION) {
      document.addEventListener('mousemove', this.eventListener.bind(this), { capture: true });

      this.mutationObserver = new MutationObserver(this.mutationListener.bind(this));
      this.mutationObserver.observe(document.body, { attributes: true, childList: true, subtree: true });
    } else {
      this.configuration.events?.forEach((type: string) => {
        document.addEventListener(type, this.eventListener.bind(this), { capture: true });
      });
    }
  }

  /**
   * Pause tracking.
   * @param duration - Defines how long the tracker should ignore incomming events.
   * If duration is not passed, the tracker will pause until `resume()` is called.
   */
  pause(duration?: number): void {
    if (this.isPaused) {
      console.warn('[TRACKER]: called `pause()` on an already paused tracker.');
    }

    if (this.STOPPED_STATUSES.includes(this.status)) {
      throw new Error(TrackerError.CANNOT_PAUSE_UNSTARTED);
    }

    this.isPaused = true;
    this.status = 'PAUSED';

    if (duration) {
      setTimeout(() => {
        this.resume();
      }, duration);
    }
  }

  /**
   * Resume tracking after it's been paused. It has no effect if `pause()` hasn't been called.
   */
  resume(): void {
    if (!this.isPaused) {
      console.warn('[TRACKER]: called `resume()` on an already running tracker.');
    }

    if (this.STOPPED_STATUSES.includes(this.status)) {
      throw new Error(TrackerError.CANNOT_RESUME_UNSTARTED);
    }

    this.isPaused = true;
    this.status = 'RUNNING';
  }

  stop(): void {
    if (this.STOPPED_STATUSES.includes(this.status)) {
      throw new Error(TrackerError.CANNOT_STOP_UNSTARTED);
    }

    if (this.configuration.level === TrackingLevel.MUTATION) {
      document.removeEventListener('mousemove', this.eventListener.bind(this), { capture: true });
      this.mutationObserver?.disconnect();
    } else {
      this.configuration.events?.forEach((type: string) => {
        document.removeEventListener(type, this.eventListener.bind(this), { capture: true });
      });
    }

    this.status = 'STOPPED';
  }

  private async eventListener(event: Event | MutationRecord[]): Promise<void> {
    if (!this.isPaused) {
      /**
       * TODO: add browser, device, language, ip, attribution, referred, location infos...
       */

      const customData: any = {};

      const prefix = 'track-';

      const target = (event as Event).target as HTMLElement;
      const attrs: string[] = target.getAttributeNames().filter((name: string) => name.startsWith(prefix));

      if (this.configuration.level === TrackingLevel.MARKED && !attrs.length) {
        return;
      }

      attrs.forEach((attr: string) => {
        const attribute: Attr | null = target.getAttributeNode(attr);
        customData[attribute?.name.substring(prefix.length) as string] = attribute?.value;
      });

      const trackerEvent: TrackerEvent = {
        timestamp: Date.now(),
        type: Array.isArray(event) ? 'mutation' : event.type,
        event: event,
        ua: this.uaParser.getResult(),
        url: parse(document.location.href),
        data: customData,
      };

      this.emit('track', trackerEvent);
    }
  }

  private async mutationListener(mutation: MutationRecord[]): Promise<void> {
    if (!this.isPaused) {
      /**
       * TODO: add browser, device, language, ip, attribution, referred, location infos...
       */

      const trackerEvent: TrackerEvent = {
        timestamp: Date.now(),
        type: 'mutation',
        event: mutation,
        ua: this.uaParser.getResult(),
        url: parse(document.location.href),
        data: {},
      };

      this.emit('track', trackerEvent);
    }
  }
}

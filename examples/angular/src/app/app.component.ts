import { Component, OnInit } from '@angular/core';

import { Tracker, TrackerEvent, TrackingLevel } from '../../../../lib/index';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'angular';

  tracker: Tracker = Tracker.init({ level: TrackingLevel.MARKED, events: ['click', 'keypress'] });

  events: any[] = [];

  ngOnInit(): void {
    this.tracker.start();

    this.tracker.on('track', (event: TrackerEvent) => {
      console.log(event);
      if (event.type !== 'mutation') {
        this.events.push(event);
      }
    });
  }

  click(event: Event): void {
    event.stopPropagation();
  }
}

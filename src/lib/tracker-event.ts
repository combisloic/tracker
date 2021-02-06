export interface TrackerEvent {
  type: string;
  event: Event | MutationRecord[];
  url: any;
  ua: any;
  data: { [key: string]: any };
}

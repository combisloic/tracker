export class TrackerError {
  static readonly CANNOT_TRACK_STARTED: string = '[TRACKER] - Cannot call `track()` on an already started starcker.';
  static readonly CANNOT_PAUSE_UNSTARTED: string =
    '[TRACKER] - Cannot pause an unstarted tracker. Should call `track()` first.';
  static readonly CANNOT_RESUME_UNSTARTED: string =
    '[TRACKER] - Cannot resume an unstarted tracker. Should call `track()` first.';
  static readonly CANNOT_STOP_UNSTARTED: string =
    '[TRACKER] - Cannot stop an unstarted tracker. Should call `track()` first.';

  static readonly INTERCEPTOR_IS_NOT_A_FUNCTION: string = '[TRACKER] - Interceptor is not a function.';
}

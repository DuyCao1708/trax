export type SyncResult<T> =
  | {
      hasChanged: false;
    }
  | {
      hasChanged: true;
      changes: T[];
    };

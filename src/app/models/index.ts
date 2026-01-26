export type SyncResult<T> =
  | {
      hasChanged: false;
    }
  | {
      hasChanged: true;
      changes: T[];
    };

export type Period = { value: 'today' | 'week' | 'month' | 'year' | 'custom'; label: string };

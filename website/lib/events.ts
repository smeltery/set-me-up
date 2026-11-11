export type EventProperties = Record<string, string | number | boolean | null>;
export type EventName = string;
export type Event = { name: string; properties?: EventProperties };
export const trackEvent = (_event: Event) => {};

export const pageContext = (): EventProperties => ({});

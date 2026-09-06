
/** One carrier in `found_in_services` / `checkedServices`. */
export interface TrackGlobalService {
  id: number;
  name: string;
  alias: string;
  image_path: string;
}

/** A single tracking checkpoint. `translated_action` is the RU string your UI shows. */
export interface TrackGlobalEvent {
  action: string;
  translated_action: string;
  location: { city: string; country: string };
  service: string;
  language: string;
  date: string;                              // "2023-05-12 11:33:44"
  separate_date: { date: string; time: string };
  image_path: string;
}

/** The inner `data` object — what you cache and what globalTrackingMarkup() reads. */
export interface TrackGlobalData {
  status: number;                            // 1 = found, 0 = nothing
  fromLocation: string;
  toLocation: string;
  track: string;
  days: string;
  dimensions: { weight: number; measure: string };
  lastCheckedAt: string;
  strategy: string | null;
  // `result` is absent/empty on a status:0 miss — hence optional + null.
  result: {
    events: TrackGlobalEvent[];
    found_in_services: Record<string, TrackGlobalService>;
  } | null;
}

/** The full envelope RapidAPI returns. */
export interface TrackGlobalResponse {
  status: "success" | "error";
  message: string | null;
  data: TrackGlobalData;
}

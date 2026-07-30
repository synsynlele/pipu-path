import type { DiscoveryErrorCode } from "./discovery-errors";

export type DiscoveryFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  code?: DiscoveryErrorCode;
  destination?: string;
};

export const initialDiscoveryFormState: DiscoveryFormState = { status: "idle" };

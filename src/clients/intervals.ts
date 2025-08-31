import createClient from "openapi-fetch";
import type { paths } from "../generated/intervals-types";

export function createIntervalsClient(accessToken: string) {
  const client = createClient<paths>({
    baseUrl: "https://intervals.icu",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return client;
}

import createClient from "openapi-fetch";
import type { paths } from "../generated/intervals-types";

export function createIntervalsClient(authHeader: string) {
  const client = createClient<paths>({
    baseUrl: "https://intervals.icu",
    headers: {
      Authorization: authHeader,
    },
  });

  return client;
}

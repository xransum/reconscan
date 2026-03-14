import { render, screen } from "@testing-library/react";

import NetworkTab from "./NetworkTab";
import type { NetworkRequest } from "@/lib/types";

describe("NetworkTab", () => {
  it("shows empty state when no requests", () => {
    render(<NetworkTab requests={[]} />);
    expect(screen.getByText(/no network requests/i)).toBeTruthy();
  });

  it("renders a row per request", () => {
    const requests: NetworkRequest[] = [
      {
        job_id: "j",
        url: "https://example.com/style.css",
        method: "GET",
        status_code: 200,
        mime_type: "text/css",
        size: 1024,
        timing_ms: 45.2,
      },
      {
        job_id: "j",
        url: "https://example.com/app.js",
        method: "GET",
        status_code: 404,
        mime_type: "application/javascript",
        size: 0,
        timing_ms: 12.0,
      },
    ];
    render(<NetworkTab requests={requests} />);
    expect(screen.getByText("https://example.com/style.css")).toBeTruthy();
    expect(screen.getByText("https://example.com/app.js")).toBeTruthy();
    expect(screen.getByText("200")).toBeTruthy();
    expect(screen.getByText("404")).toBeTruthy();
  });
});

import { render, screen } from "@testing-library/react";

import JobHeader from "./JobHeader";
import type { Job } from "@/lib/types";

const baseJob: Job = {
  id: "abc-123",
  url: "https://example.com",
  status: "complete",
  created_at: "2024-01-01T00:00:00",
  completed_at: "2024-01-01T00:00:05",
};

describe("JobHeader", () => {
  it("renders the URL", () => {
    render(<JobHeader job={baseJob} />);
    expect(screen.getByText("https://example.com")).toBeTruthy();
  });

  it("renders the status badge", () => {
    render(<JobHeader job={baseJob} />);
    expect(screen.getByText("complete")).toBeTruthy();
  });

  it("renders the job id", () => {
    render(<JobHeader job={baseJob} />);
    expect(screen.getByText(/abc-123/)).toBeTruthy();
  });

  it("renders failed status with red styling", () => {
    const job: Job = { ...baseJob, status: "failed" };
    render(<JobHeader job={job} />);
    expect(screen.getByText("failed")).toBeTruthy();
  });
});

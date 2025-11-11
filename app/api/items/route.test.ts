import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const mockFrom = vi.fn();
const mockSupabase = {
  from: mockFrom,
};

vi.mock("../../../lib/supabaseServer", () => ({
  supabaseServer: () => mockSupabase,
}));

const buildRequest = (body: unknown) =>
  new Request("http://localhost/api/items", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });

beforeEach(() => {
  const mockSingle = vi.fn().mockResolvedValue({ data: { id: "item-123" }, error: null });
  const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
  const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
  mockFrom.mockReturnValue({
    insert: mockInsert,
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/items", () => {
  it("returns 400 when required fields are missing", async () => {
    const response = await POST(buildRequest({}));
    expect(response.status).toBe(400);
    const payload = (await response.json()) as { error: string };
    expect(payload.error).toMatch(/garageId/i);
  });

  it("validates numeric price", async () => {
    const response = await POST(
      buildRequest({
        garageId: "garage-1",
        title: "Lamp",
        price: "abc",
      }),
    );
    expect(response.status).toBe(400);
    const payload = (await response.json()) as { error: string };
    expect(payload.error).toMatch(/Price must be a number/);
  });

  it("creates an item and returns the new id", async () => {
    const response = await POST(
      buildRequest({
        garageId: "garage-1",
        title: "Lamp",
        price: "10.50",
        description: "Great lamp",
        photoUrl: "https://example.com/lamp.jpg",
      }),
    );
    expect(response.status).toBe(201);
    const payload = (await response.json()) as { id: string };
    expect(payload.id).toBe("item-123");
    expect(mockFrom).toHaveBeenCalledWith("items");
  });
});

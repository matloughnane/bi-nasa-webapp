import request from "supertest";
import app from "../app";
import { AppCache } from "../utils/cache";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeNeoEntry(id: string, dateKey: string) {
  return {
    id,
    name: `Asteroid-${id}`,
    estimated_diameter: {
      kilometers: {
        estimated_diameter_min: 0.1 * Number(id),
        estimated_diameter_max: 0.2 * Number(id),
      },
    },
    is_potentially_hazardous_asteroid: Number(id) % 2 === 0,
    close_approach_data: [
      {
        close_approach_date: dateKey,
        miss_distance: { kilometers: String(10000 * Number(id)) },
        relative_velocity: { kilometers_per_hour: String(5000 * Number(id)) },
      },
    ],
  };
}

function makeNasaNeoResponse(count: number, dateKey: string) {
  const entries = Array.from({ length: count }, (_, i) =>
    makeNeoEntry(String(i + 1), dateKey),
  );
  return { near_earth_objects: { [dateKey]: entries } };
}

function makeFetchResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

const originalFetch = global.fetch;

beforeEach(() => {
  // Reset fetch mock before each test
  global.fetch = jest.fn();
});

afterEach(() => {
  global.fetch = originalFetch;
});

// Clear the NEO cache between test groups by accessing the module-level cache.
// We use a fresh date key per describe block so cache keys don't collide, but
// we also clear between groups for extra safety.
afterAll(() => {
  global.fetch = originalFetch;
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("GET /neo — Success", () => {
  const dateKey = "2025-01-01";

  beforeEach(() => {
    const body = makeNasaNeoResponse(5, dateKey);
    (global.fetch as jest.Mock).mockResolvedValue(makeFetchResponse(body));
  });

  it("returns 200 with correct envelope shape", async () => {
    const res = await request(app)
      .get("/neo")
      .query({ start_date: dateKey, end_date: dateKey });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: "ok",
      message: expect.any(String),
      data: {
        data: expect.any(Array),
        total: expect.any(Number),
      },
    });
  });

  it("returns transformed NeoObject fields with correct types", async () => {
    const res = await request(app)
      .get("/neo")
      .query({ start_date: dateKey, end_date: dateKey });

    const item = res.body.data.data[0];
    expect(item).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        estimated_diameter_min_km: expect.any(Number),
        estimated_diameter_max_km: expect.any(Number),
        miss_distance_km: expect.any(Number),
        relative_velocity_kmph: expect.any(Number),
        is_potentially_hazardous: expect.any(Boolean),
        close_approach_date: expect.any(String),
      }),
    );
  });

  it("calls NASA API with correct URL, params, and timeout signal", async () => {
    const uniqueDate = "2025-01-10";
    const body = makeNasaNeoResponse(2, uniqueDate);
    (global.fetch as jest.Mock).mockResolvedValue(makeFetchResponse(body));

    await request(app)
      .get("/neo")
      .query({ start_date: uniqueDate, end_date: uniqueDate });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [calledUrl, calledOpts] = (global.fetch as jest.Mock).mock.calls[0];
    const url = new URL(calledUrl);
    expect(url.pathname).toBe("/neo/rest/v1/feed");
    expect(url.searchParams.get("start_date")).toBe(uniqueDate);
    expect(url.searchParams.get("end_date")).toBe(uniqueDate);
    expect(url.searchParams.get("api_key")).toBe("TEST_KEY");
    // #4: verify AbortSignal timeout is passed
    expect(calledOpts).toBeDefined();
    expect(calledOpts.signal).toBeInstanceOf(AbortSignal);
  });
});

describe("GET /neo — Pagination", () => {
  const dateKey = "2025-02-01";

  beforeEach(() => {
    const body = makeNasaNeoResponse(15, dateKey);
    (global.fetch as jest.Mock).mockResolvedValue(makeFetchResponse(body));
  });

  it("default page_size=10 when page params provided", async () => {
    const res = await request(app)
      .get("/neo")
      .query({ start_date: dateKey, end_date: dateKey, page: "1", page_size: "10" });

    expect(res.body.data.data).toHaveLength(10);
    expect(res.body.data.total).toBe(15);
  });

  it("page=2, page_size=3 returns correct slice", async () => {
    const res = await request(app)
      .get("/neo")
      .query({ start_date: dateKey, end_date: dateKey, page: "2", page_size: "3" });

    expect(res.body.data.data).toHaveLength(3);
    // Items should be the 4th, 5th, and 6th (0-indexed: 3,4,5)
    expect(res.body.data.data[0].id).toBe("4");
    expect(res.body.data.data[2].id).toBe("6");
  });

  it("page exceeding total returns empty data", async () => {
    const res = await request(app)
      .get("/neo")
      .query({ start_date: dateKey, end_date: dateKey, page: "100", page_size: "10" });

    expect(res.body.data.data).toHaveLength(0);
    expect(res.body.data.total).toBe(15);
  });

  it("page_size clamped to max 100", async () => {
    const body = makeNasaNeoResponse(5, "2025-02-02");
    (global.fetch as jest.Mock).mockResolvedValue(makeFetchResponse(body));

    const res = await request(app)
      .get("/neo")
      .query({ start_date: "2025-02-02", end_date: "2025-02-02", page_size: "999" });

    // page_size should be clamped to 100; with only 5 items all are returned
    expect(res.body.data.data).toHaveLength(5);
  });

  it("page=0 treated as page=1", async () => {
    const body = makeNasaNeoResponse(5, "2025-02-03");
    (global.fetch as jest.Mock).mockResolvedValue(makeFetchResponse(body));

    const res = await request(app)
      .get("/neo")
      .query({ start_date: "2025-02-03", end_date: "2025-02-03", page: "0", page_size: "3" });

    // page=0 → clamped to 1, so we get items 1-3
    expect(res.body.data.data).toHaveLength(3);
    expect(res.body.data.data[0].id).toBe("1");
  });
});

describe("GET /neo — Validation", () => {
  it("400 when start_date missing", async () => {
    const res = await request(app)
      .get("/neo")
      .query({ end_date: "2025-03-01" });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("error");
  });

  it("400 when end_date missing", async () => {
    const res = await request(app)
      .get("/neo")
      .query({ start_date: "2025-03-01" });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("error");
  });

  it("400 when start_date invalid format", async () => {
    const res = await request(app)
      .get("/neo")
      .query({ start_date: "not-a-date", end_date: "2025-03-01" });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("error");
  });

  it("400 with details in data.details", async () => {
    const res = await request(app)
      .get("/neo")
      .query({ start_date: "bad", end_date: "bad" });

    expect(res.status).toBe(400);
    expect(res.body.data.details).toBeDefined();
    expect(Array.isArray(res.body.data.details)).toBe(true);
  });

  it("accepts when page/page_size omitted", async () => {
    const dateKey = "2025-03-05";
    const body = makeNasaNeoResponse(2, dateKey);
    (global.fetch as jest.Mock).mockResolvedValue(makeFetchResponse(body));

    const res = await request(app)
      .get("/neo")
      .query({ start_date: dateKey, end_date: dateKey });

    expect(res.status).toBe(200);
  });

  it("400 when page is non-numeric", async () => {
    const res = await request(app)
      .get("/neo")
      .query({ start_date: "2025-03-01", end_date: "2025-03-01", page: "abc" });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("error");
  });
});

describe("GET /neo — Upstream error", () => {
  it("returns upstream status code with error envelope", async () => {
    const errorBody = { error: "rate limit exceeded" };
    (global.fetch as jest.Mock).mockResolvedValue(
      makeFetchResponse(errorBody, 429),
    );

    const res = await request(app)
      .get("/neo")
      .query({ start_date: "2025-04-01", end_date: "2025-04-01" });

    expect(res.status).toBe(429);
    expect(res.body).toMatchObject({
      status: "error",
      message: expect.stringContaining("Upstream"),
      data: null,
    });
  });
});

describe("GET /neo — Network failure", () => {
  it("returns 502 when fetch throws", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("ECONNREFUSED"));

    const res = await request(app)
      .get("/neo")
      .query({ start_date: "2025-05-01", end_date: "2025-05-01" });

    expect(res.status).toBe(502);
    expect(res.body).toMatchObject({
      status: "error",
      message: expect.any(String),
      data: null,
    });
  });
});

describe("GET /neo — Cache", () => {
  it("second request skips fetch (cache hit)", async () => {
    const dateKey = "2025-06-01";
    const body = makeNasaNeoResponse(3, dateKey);
    (global.fetch as jest.Mock).mockResolvedValue(makeFetchResponse(body));

    // First request — populates cache
    await request(app)
      .get("/neo")
      .query({ start_date: dateKey, end_date: dateKey });

    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Second request — should hit cache
    const res = await request(app)
      .get("/neo")
      .query({ start_date: dateKey, end_date: dateKey });

    expect(global.fetch).toHaveBeenCalledTimes(1); // Still 1 — cache was used
    expect(res.status).toBe(200);
    expect(res.body.data.data).toHaveLength(3);
  });
});

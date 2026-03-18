import request from "supertest";
import app from "../app";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFlrEntry(index: number, dateStr: string) {
  const classes = ["X1.0", "M5.2", "C3.1", "B2.0", "A1.0"];
  return {
    flrID: `FLR-${index}`,
    beginTime: `${dateStr}T0${index % 10}:00Z`,
    peakTime: `${dateStr}T0${index % 10}:30Z`,
    endTime: index % 3 === 0 ? null : `${dateStr}T0${index % 10}:45Z`,
    classType: classes[index % classes.length],
    sourceLocation: `N${10 + index}E${20 + index}`,
    activeRegionNum: index % 4 === 0 ? null : 13000 + index,
    note: `Test flare event ${index}`,
    linkedEvents:
      index % 2 === 0
        ? [{ activityID: `CME-${index}` }]
        : null,
    link: `https://api.nasa.gov/DONKI/FLR/${index}`,
  };
}

function makeNasaFlrResponse(count: number, dateStr: string) {
  return Array.from({ length: count }, (_, i) => makeFlrEntry(i + 1, dateStr));
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
  global.fetch = jest.fn();
});

afterEach(() => {
  global.fetch = originalFetch;
});

afterAll(() => {
  global.fetch = originalFetch;
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("GET /flr — Success", () => {
  const dateKey = "2025-01-01";

  beforeEach(() => {
    const body = makeNasaFlrResponse(5, dateKey);
    (global.fetch as jest.Mock).mockResolvedValue(makeFetchResponse(body));
  });

  it("returns 200 with correct envelope shape", async () => {
    const res = await request(app)
      .get("/flr")
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

  it("returns transformed FlrObject fields with correct types", async () => {
    const res = await request(app)
      .get("/flr")
      .query({ start_date: dateKey, end_date: dateKey });

    const item = res.body.data.data[0];
    expect(item).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        begin_time: expect.any(String),
        peak_time: expect.any(String),
        class_type: expect.any(String),
        source_location: expect.any(String),
        linked_events: expect.any(Number),
        link: expect.any(String),
      }),
    );
  });

  it("maps null end_time correctly", async () => {
    const res = await request(app)
      .get("/flr")
      .query({ start_date: dateKey, end_date: dateKey });

    // Entry index 3 (i+1=3, 3%3===0) should have null end_time
    const nullEndItem = res.body.data.data.find(
      (item: { id: string }) => item.id === "FLR-3",
    );
    expect(nullEndItem.end_time).toBeNull();
  });

  it("counts linked events correctly", async () => {
    const res = await request(app)
      .get("/flr")
      .query({ start_date: dateKey, end_date: dateKey });

    // Even-indexed entries have 1 linked event, odd have 0
    const withLinked = res.body.data.data.find(
      (item: { id: string }) => item.id === "FLR-2",
    );
    const withoutLinked = res.body.data.data.find(
      (item: { id: string }) => item.id === "FLR-1",
    );
    expect(withLinked.linked_events).toBe(1);
    expect(withoutLinked.linked_events).toBe(0);
  });

  it("maps null active_region_num correctly", async () => {
    const res = await request(app)
      .get("/flr")
      .query({ start_date: dateKey, end_date: dateKey });

    // Entry index 4 (i+1=4, 4%4===0) should have null active_region_num
    const nullRegion = res.body.data.data.find(
      (item: { id: string }) => item.id === "FLR-4",
    );
    expect(nullRegion.active_region_num).toBeNull();
  });

  it("calls NASA DONKI API with correct URL and params", async () => {
    const uniqueDate = "2025-01-10";
    const body = makeNasaFlrResponse(2, uniqueDate);
    (global.fetch as jest.Mock).mockResolvedValue(makeFetchResponse(body));

    await request(app)
      .get("/flr")
      .query({ start_date: uniqueDate, end_date: uniqueDate });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [calledUrl, calledOpts] = (global.fetch as jest.Mock).mock.calls[0];
    const url = new URL(calledUrl);
    expect(url.pathname).toBe("/DONKI/FLR");
    expect(url.searchParams.get("startDate")).toBe(uniqueDate);
    expect(url.searchParams.get("endDate")).toBe(uniqueDate);
    expect(url.searchParams.get("api_key")).toBe("TEST_KEY");
    expect(calledOpts).toBeDefined();
    expect(calledOpts.signal).toBeInstanceOf(AbortSignal);
  });
});

describe("GET /flr — Pagination", () => {
  const dateKey = "2025-02-01";

  beforeEach(() => {
    const body = makeNasaFlrResponse(15, dateKey);
    (global.fetch as jest.Mock).mockResolvedValue(makeFetchResponse(body));
  });

  it("returns paginated results with correct page_size", async () => {
    const res = await request(app)
      .get("/flr")
      .query({ start_date: dateKey, end_date: dateKey, page: "1", page_size: "5" });

    expect(res.body.data.data).toHaveLength(5);
    expect(res.body.data.total).toBe(15);
  });

  it("page=2, page_size=3 returns correct slice", async () => {
    const res = await request(app)
      .get("/flr")
      .query({ start_date: dateKey, end_date: dateKey, page: "2", page_size: "3" });

    expect(res.body.data.data).toHaveLength(3);
    expect(res.body.data.data[0].id).toBe("FLR-4");
    expect(res.body.data.data[2].id).toBe("FLR-6");
  });

  it("page exceeding total returns empty data", async () => {
    const res = await request(app)
      .get("/flr")
      .query({ start_date: dateKey, end_date: dateKey, page: "100", page_size: "10" });

    expect(res.body.data.data).toHaveLength(0);
    expect(res.body.data.total).toBe(15);
  });

  it("page_size clamped to max 100", async () => {
    const body = makeNasaFlrResponse(5, "2025-02-02");
    (global.fetch as jest.Mock).mockResolvedValue(makeFetchResponse(body));

    const res = await request(app)
      .get("/flr")
      .query({ start_date: "2025-02-02", end_date: "2025-02-02", page_size: "999" });

    expect(res.body.data.data).toHaveLength(5);
  });

  it("page=0 treated as page=1", async () => {
    const body = makeNasaFlrResponse(5, "2025-02-03");
    (global.fetch as jest.Mock).mockResolvedValue(makeFetchResponse(body));

    const res = await request(app)
      .get("/flr")
      .query({ start_date: "2025-02-03", end_date: "2025-02-03", page: "0", page_size: "3" });

    expect(res.body.data.data).toHaveLength(3);
    expect(res.body.data.data[0].id).toBe("FLR-1");
  });
});

describe("GET /flr — Validation", () => {
  it("400 when start_date missing", async () => {
    const res = await request(app)
      .get("/flr")
      .query({ end_date: "2025-03-01" });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("error");
  });

  it("400 when end_date missing", async () => {
    const res = await request(app)
      .get("/flr")
      .query({ start_date: "2025-03-01" });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("error");
  });

  it("400 when start_date invalid format", async () => {
    const res = await request(app)
      .get("/flr")
      .query({ start_date: "not-a-date", end_date: "2025-03-01" });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("error");
  });

  it("400 with details in data.details", async () => {
    const res = await request(app)
      .get("/flr")
      .query({ start_date: "bad", end_date: "bad" });

    expect(res.status).toBe(400);
    expect(res.body.data.details).toBeDefined();
    expect(Array.isArray(res.body.data.details)).toBe(true);
  });

  it("accepts when page/page_size omitted", async () => {
    const dateKey = "2025-03-05";
    const body = makeNasaFlrResponse(2, dateKey);
    (global.fetch as jest.Mock).mockResolvedValue(makeFetchResponse(body));

    const res = await request(app)
      .get("/flr")
      .query({ start_date: dateKey, end_date: dateKey });

    expect(res.status).toBe(200);
  });

  it("400 when page is non-numeric", async () => {
    const res = await request(app)
      .get("/flr")
      .query({ start_date: "2025-03-01", end_date: "2025-03-01", page: "abc" });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("error");
  });
});

describe("GET /flr — Upstream error", () => {
  it("returns upstream status code with error envelope", async () => {
    const errorBody = { error: "rate limit exceeded" };
    (global.fetch as jest.Mock).mockResolvedValue(
      makeFetchResponse(errorBody, 429),
    );

    const res = await request(app)
      .get("/flr")
      .query({ start_date: "2025-04-01", end_date: "2025-04-01" });

    expect(res.status).toBe(429);
    expect(res.body).toMatchObject({
      status: "error",
      message: expect.stringContaining("Upstream"),
      data: null,
    });
  });
});

describe("GET /flr — Network failure", () => {
  it("returns 502 when fetch throws", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("ECONNREFUSED"));

    const res = await request(app)
      .get("/flr")
      .query({ start_date: "2025-05-01", end_date: "2025-05-01" });

    expect(res.status).toBe(502);
    expect(res.body).toMatchObject({
      status: "error",
      message: expect.any(String),
      data: null,
    });
  });
});

describe("GET /flr — Cache", () => {
  it("second request skips fetch (cache hit)", async () => {
    const dateKey = "2025-06-01";
    const body = makeNasaFlrResponse(3, dateKey);
    (global.fetch as jest.Mock).mockResolvedValue(makeFetchResponse(body));

    await request(app)
      .get("/flr")
      .query({ start_date: dateKey, end_date: dateKey });

    expect(global.fetch).toHaveBeenCalledTimes(1);

    const res = await request(app)
      .get("/flr")
      .query({ start_date: dateKey, end_date: dateKey });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);
    expect(res.body.data.data).toHaveLength(3);
  });
});

describe("GET /flr — Empty response", () => {
  it("handles empty array from NASA API", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(makeFetchResponse([]));

    const res = await request(app)
      .get("/flr")
      .query({ start_date: "2025-07-01", end_date: "2025-07-01" });

    expect(res.status).toBe(200);
    expect(res.body.data.data).toHaveLength(0);
    expect(res.body.data.total).toBe(0);
  });
});

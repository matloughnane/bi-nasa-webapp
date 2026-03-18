import { screen, waitFor } from "@testing-library/react"
import type { NeoObject, PaginatedResponse } from "@/lib/services/neo"
import { renderWithProviders } from "../utils/render"
import NearEarthObjectsPage from "@/app/(dashboard)/near-earth-objects/page"

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockFetchNeo = jest.fn()
jest.mock("@/lib/services/neo", () => ({
  fetchNeo: (...args: unknown[]) => mockFetchNeo(...args),
}))

jest.mock("@/components/neo/neo-chart", () => ({
  NeoChart: () => <div data-testid="neo-chart" />,
}))

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

let neoIdCounter = 0

function makeNeo(overrides?: Partial<NeoObject>): NeoObject {
  neoIdCounter += 1
  return {
    id: String(neoIdCounter),
    name: `Asteroid-${neoIdCounter}`,
    estimated_diameter_min_km: 0.05,
    estimated_diameter_max_km: 0.12,
    miss_distance_km: 500_000,
    relative_velocity_kmph: 40_000,
    is_potentially_hazardous: false,
    close_approach_date: "2026-03-12",
    ...overrides,
  }
}

function makePaginatedResponse(
  data: NeoObject[],
  total?: number,
): PaginatedResponse<NeoObject> {
  return { data, total: total ?? data.length }
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

beforeAll(() => {
  jest.useFakeTimers()
  jest.setSystemTime(new Date("2026-03-15"))
})

afterAll(() => {
  jest.useRealTimers()
})

beforeEach(() => {
  neoIdCounter = 0
  mockFetchNeo.mockReset()
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("NearEarthObjectsPage", () => {
  // 1. Loading state
  it("shows loading state while data is being fetched", () => {
    mockFetchNeo.mockReturnValue(new Promise(() => {})) // never resolves

    renderWithProviders(<NearEarthObjectsPage />)

    expect(screen.getByText("Loading asteroid data...")).toBeInTheDocument()
    expect(screen.queryByTestId("neo-chart")).not.toBeInTheDocument()
  })

  // 2. Error state
  it("shows error message when fetch fails", async () => {
    mockFetchNeo.mockRejectedValue(new Error("Network error"))

    renderWithProviders(<NearEarthObjectsPage />)

    await waitFor(() => {
      expect(screen.getByText(/Failed to load data/)).toBeInTheDocument()
    })
    expect(screen.getByText(/Network error/)).toBeInTheDocument()
  })

  // 3. Empty results
  it("shows chart and 'No results.' when data is empty", async () => {
    mockFetchNeo.mockResolvedValue(makePaginatedResponse([], 0))

    renderWithProviders(<NearEarthObjectsPage />)

    await waitFor(() => {
      expect(screen.getByTestId("neo-chart")).toBeInTheDocument()
    })
    expect(screen.getByText("No results.")).toBeInTheDocument()
  })

  // 4. Mixed data — 1 safe + 1 hazardous
  it("renders both safe and hazardous NEOs in the table", async () => {
    const safe = makeNeo({ name: "SafeRock", is_potentially_hazardous: false })
    const hazardous = makeNeo({
      name: "DangerRock",
      is_potentially_hazardous: true,
    })
    mockFetchNeo.mockResolvedValue(makePaginatedResponse([safe, hazardous]))

    renderWithProviders(<NearEarthObjectsPage />)

    await waitFor(() => {
      expect(screen.getByText("SafeRock")).toBeInTheDocument()
    })
    expect(screen.getByText("DangerRock")).toBeInTheDocument()
    expect(screen.getByText("Yes")).toBeInTheDocument()
    expect(screen.getByText("No")).toBeInTheDocument()
  })

  // 5. All hazardous
  it("shows only 'Yes' badges when all NEOs are hazardous", async () => {
    const neos = [
      makeNeo({ name: "Hazard-A", is_potentially_hazardous: true }),
      makeNeo({ name: "Hazard-B", is_potentially_hazardous: true }),
    ]
    mockFetchNeo.mockResolvedValue(makePaginatedResponse(neos))

    renderWithProviders(<NearEarthObjectsPage />)

    await waitFor(() => {
      expect(screen.getByText("Hazard-A")).toBeInTheDocument()
    })

    const yesBadges = screen.getAllByText("Yes")
    expect(yesBadges).toHaveLength(2)

    // The table column header "Hazardous" text also exists, but no "No" badge
    const noBadges = screen.queryAllByText("No")
    expect(noBadges).toHaveLength(0)
  })

  // 6. All safe
  it("shows only 'No' badges when all NEOs are safe", async () => {
    const neos = [
      makeNeo({ name: "Safe-A", is_potentially_hazardous: false }),
      makeNeo({ name: "Safe-B", is_potentially_hazardous: false }),
    ]
    mockFetchNeo.mockResolvedValue(makePaginatedResponse(neos))

    renderWithProviders(<NearEarthObjectsPage />)

    await waitFor(() => {
      expect(screen.getByText("Safe-A")).toBeInTheDocument()
    })

    const noBadges = screen.getAllByText("No")
    expect(noBadges).toHaveLength(2)

    const yesBadges = screen.queryAllByText("Yes")
    expect(yesBadges).toHaveLength(0)
  })

  // 7. Page heading
  it("renders heading, description, and 7-day note", async () => {
    mockFetchNeo.mockResolvedValue(makePaginatedResponse([makeNeo()]))

    renderWithProviders(<NearEarthObjectsPage />)

    expect(screen.getByText("Near Earth Objects")).toBeInTheDocument()
    expect(
      screen.getByText(/Asteroid close-approach data from NASA/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/This API is limited to 7 days/),
    ).toBeInTheDocument()
  })

  // 8. No projected-data banner by default (endDate === today)
  it("does not show projected data banner when end date equals today", async () => {
    mockFetchNeo.mockResolvedValue(makePaginatedResponse([makeNeo()]))

    renderWithProviders(<NearEarthObjectsPage />)

    await waitFor(() => {
      expect(screen.getByTestId("neo-chart")).toBeInTheDocument()
    })

    expect(
      screen.queryByText(/Results include projected data/),
    ).not.toBeInTheDocument()
  })

  // 9. fetchNeo called with correct params
  it("calls fetchNeo with correct date range and pagination params", async () => {
    mockFetchNeo.mockResolvedValue(makePaginatedResponse([makeNeo()]))

    renderWithProviders(<NearEarthObjectsPage />)

    await waitFor(() => {
      expect(mockFetchNeo).toHaveBeenCalled()
    })

    expect(mockFetchNeo).toHaveBeenCalledWith(
      "2026-03-08", // 7 days before 2026-03-15
      "2026-03-15", // today
      1, // page (pageIndex 0 + 1)
      30, // pageSize
    )
  })

  // 10. Spinner during refetch
  it("shows spinner when refetching", async () => {
    // First call resolves immediately
    mockFetchNeo.mockResolvedValueOnce(makePaginatedResponse([makeNeo()]))

    const { queryClient } = renderWithProviders(<NearEarthObjectsPage />)

    // Wait for initial data to render
    await waitFor(() => {
      expect(screen.getByTestId("neo-chart")).toBeInTheDocument()
    })

    // Second call never resolves — simulates pending refetch
    mockFetchNeo.mockReturnValue(new Promise(() => {}))

    // Trigger a refetch
    queryClient.invalidateQueries({ queryKey: ["neo"] })

    await waitFor(() => {
      expect(document.querySelector(".animate-spin")).toBeInTheDocument()
    })
  })
})

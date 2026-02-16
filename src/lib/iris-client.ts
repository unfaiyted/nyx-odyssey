// Iris Image Extraction Service Client
// Internal: http://localhost:3007 | External: https://iris.nyxed.dev

const IRIS_BASE_URL =
  process.env.IRIS_URL || "http://localhost:3007";
const DEFAULT_TIMEOUT = 10_000;

// ── Types ──────────────────────────────────────────────

export type IrisImageType =
  | "destination"
  | "event"
  | "accommodation"
  | "person"
  | "general";

export interface IrisImage {
  url: string;
  source: string;
  width: number;
  height: number;
  score: number;
  alt: string;
}

export interface IrisExtraction {
  id: string;
  url: string;
  status: string;
  imageCount: number;
  images: IrisImage[];
  metadata: {
    title: string;
    description: string;
  };
}

export interface IrisSearchImage {
  url: string;
  thumbnailUrl: string;
  source: string;
  alt: string;
  width: number;
  height: number;
}

export interface IrisSearchResult {
  query: string;
  images: IrisSearchImage[];
  count: number;
}

export interface IrisHealthResponse {
  status: string;
  [key: string]: unknown;
}

// ── Error ──────────────────────────────────────────────

export class IrisError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = "IrisError";
  }
}

// ── Helpers ────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
  timeout = DEFAULT_TIMEOUT,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${IRIS_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => null);
      throw new IrisError(
        `Iris API error: ${res.status} ${res.statusText}`,
        res.status,
        body,
      );
    }

    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof IrisError) throw err;
    if ((err as Error).name === "AbortError") {
      throw new IrisError("Iris API request timed out", 408);
    }
    throw new IrisError(
      `Iris API request failed: ${(err as Error).message}`,
      0,
    );
  } finally {
    clearTimeout(timer);
  }
}

// ── Client ─────────────────────────────────────────────

export const iris = {
  /** Extract images from a URL */
  async extract(
    url: string,
    type?: IrisImageType,
  ): Promise<IrisExtraction> {
    return request<IrisExtraction>("/api/extract", {
      method: "POST",
      body: JSON.stringify({ url, type }),
    });
  },

  /** Search images via SearXNG */
  async search(
    query: string,
    limit?: number,
  ): Promise<IrisSearchResult> {
    return request<IrisSearchResult>("/api/search", {
      method: "POST",
      body: JSON.stringify({ query, limit }),
    });
  },

  /** Get extraction results by ID */
  async getResults(id: string): Promise<IrisExtraction> {
    return request<IrisExtraction>(`/api/results/${encodeURIComponent(id)}`);
  },

  /** Select the best image from extraction results */
  async selectImage(
    id: string,
    imageId: string,
  ): Promise<void> {
    await request(`/api/results/${encodeURIComponent(id)}/select`, {
      method: "POST",
      body: JSON.stringify({ imageId }),
    });
  },

  /** Health check */
  async health(): Promise<IrisHealthResponse> {
    return request<IrisHealthResponse>("/api/health");
  },
} as const;

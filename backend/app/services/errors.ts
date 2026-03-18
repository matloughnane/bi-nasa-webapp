export class UpstreamError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number) {
    super("Upstream NASA API error");
    this.name = "UpstreamError";
    this.statusCode = statusCode;
  }
}

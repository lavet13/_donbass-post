// Relative import on purpose: router.ts has no "@/" imports, so vitest runs
// this without being told about your tsconfig path alias.
import { describe, expect, it } from "vitest";
import { compilePath, createRouter } from "./router";

describe("compilePath", () => {
  it("captures a param and matches the whole path only", () => {
    const { regex, keys } = compilePath("/api/track/:track");
    expect(keys).toEqual(["track"]); // toEqual = deep equality (arrays); toBe = identity
    // exec() returns null on a miss → ?.[1] reads capture group 1 safely
    expect(regex.exec("/api/track/ABC")?.[1]).toBe("ABC");
    expect(regex.exec("/api/track/ABC/x")).toBeNull(); // a param can't span "/"
  });

  it("escapes literal regex characters", () => {
    // Without escaping, "." means "any char" and "/api/v1x0/5" would match.
    // This test exists to FAIL if escaping is missing.
    const { regex } = compilePath("/api/v1.0/:id");
    expect(regex.exec("/api/v1x0/5")).toBeNull();
  });

  it("captures our real route, still URL-encoded", () => {
    // The frontend calls encodeURIComponent, so Cyrillic "52А" arrives as 52%D0%90.
    // compilePath doesn't decode; that's part 3's job (decodeURIComponent).
    const { regex } = compilePath("/api/cargo-tracking/search/:query");
    expect(regex.exec("/api/cargo-tracking/search/52%D0%90")?.[1]).toBe(
      "52%D0%90",
    );
  });
});

describe("createRouter", () => {
  it("passes decoded params to the handler", async () => {
    // Arrange: the spy handler echoes whatever params it was given
    const router = createRouter();
    router.get("/api/cargo-tracking/search/:query", (_req, params) =>
      Response.json(params),
    );

    // Act: the encoded form of "52А", exactly as the frontend sends it
    const res = await router.handle(
      new Request("http://localhost/api/cargo-tracking/search/52%D0%90"),
    );

    // Assert: res.json() reads the body back into an object.
    // toEqual compares objects by content (toBe would compare identity and fail)
    expect(await res.json()).toEqual({ query: "52А" });
  });

  it("answers 400 on malformed %-encoding instead of crashing", async () => {
    const router = createRouter();
    router.get("/a/:x", () => new Response("ok"));
    // %E0%A4%A is a truncated UTF-8 sequence → decodeURIComponent throws URIError
    const res = await router.handle(new Request("http://localhost/a/%E0%A4%A"));
    expect(res.status).toBe(400);
  });

  it("sends a thrown error's 500 back out through the middlewares", async () => {
    const router = createRouter();
    // Stand-in for cors: stamps a header on the way OUT, after await next()
    router.use(async (_req, next) => {
      const res = await next();
      const headers = new Headers(res.headers);
      headers.set("X-Outer", "seen");
      return new Response(res.body, { status: res.status, headers });
    });
    router.get("/boom", () => {
      throw new Error("db down");
    });

    const res = await router.handle(new Request("http://localhost/boom"));
    expect(res.status).toBe(500);
    // Before the fix, the throw skipped the middleware's "way out", so no header
    expect(res.headers.get("X-Outer")).toBe("seen");
  });
});

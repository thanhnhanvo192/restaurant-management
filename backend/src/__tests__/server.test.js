import request from "supertest";
import { app } from "../server.js";

describe("server", () => {
  it("returns health welcome payload", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toMatch(/Welcome/);
  });

  it("returns health status payload", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBeDefined();
    expect(response.body.data.database).toBeDefined();
  });
});

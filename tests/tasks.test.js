const request = require("supertest");
const app = require("../src/app");

describe("CloudDeploy API", () => {
  test("GET / should return API running message", async () => {
    const response = await request(app).get("/");

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe(
      "CloudDeploy API is running"
    );
  });

  test("GET /health should return UP", async () => {
    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("UP");
  });

  test("POST /api/tasks should reject an empty title", async () => {
    const response = await request(app)
      .post("/api/tasks")
      .send({ title: "" });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("Task title is required");
  });
});

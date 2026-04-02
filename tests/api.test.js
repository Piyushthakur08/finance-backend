const { describe, it, before, after } = require("node:test");
const assert = require("node:assert");
const http = require("node:http");

/*
  Basic integration tests for the API.
  
  These tests run against a live server and database,
  so you need MongoDB running locally before executing them.
  
  Run with: npm test
  
  Note: These are meant as a starting point. In a real project
  you'd want a dedicated test database, setup/teardown hooks,
  and more thorough coverage.
*/

const BASE_URL = "http://localhost:3000/api";

const makeRequest = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      headers: { "Content-Type": "application/json" },
    };

    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

describe("Auth endpoints", () => {
  it("should register a new user", async () => {
    const res = await makeRequest("POST", "/api/auth/register", {
      name: "Test User",
      email: `test_${Date.now()}@example.com`,
      password: "test1234",
      role: "viewer",
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.token);
  });

  it("should reject registration with missing fields", async () => {
    const res = await makeRequest("POST", "/api/auth/register", {
      email: "bad@example.com",
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  it("should login with valid credentials", async () => {
    // First register
    const email = `login_${Date.now()}@example.com`;
    await makeRequest("POST", "/api/auth/register", {
      name: "Login Test",
      email,
      password: "pass1234",
    });

    // Then login
    const res = await makeRequest("POST", "/api/auth/login", {
      email,
      password: "pass1234",
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.data.token);
  });

  it("should reject login with wrong password", async () => {
    const res = await makeRequest("POST", "/api/auth/login", {
      email: "admin@example.com",
      password: "wrongpassword",
    });
    assert.strictEqual(res.status, 401);
  });
});

describe("Access control", () => {
  let adminToken, viewerToken;

  before(async () => {
    // Register admin
    const adminRes = await makeRequest("POST", "/api/auth/register", {
      name: "AC Admin",
      email: `ac_admin_${Date.now()}@example.com`,
      password: "admin1234",
      role: "admin",
    });
    adminToken = adminRes.body.data.token;

    // Register viewer
    const viewerRes = await makeRequest("POST", "/api/auth/register", {
      name: "AC Viewer",
      email: `ac_viewer_${Date.now()}@example.com`,
      password: "viewer1234",
      role: "viewer",
    });
    viewerToken = viewerRes.body.data.token;
  });

  it("should allow admin to create a record", async () => {
    const res = await makeRequest(
      "POST",
      "/api/records",
      {
        amount: 5000,
        type: "income",
        category: "salary",
        date: "2024-01-15",
        description: "Test income",
      },
      adminToken
    );
    assert.strictEqual(res.status, 201);
  });

  it("should deny viewer from creating a record", async () => {
    const res = await makeRequest(
      "POST",
      "/api/records",
      {
        amount: 5000,
        type: "income",
        category: "salary",
        date: "2024-01-15",
      },
      viewerToken
    );
    assert.strictEqual(res.status, 403);
  });

  it("should allow viewer to access summary", async () => {
    const res = await makeRequest("GET", "/api/summary/overview", null, viewerToken);
    assert.strictEqual(res.status, 200);
  });

  it("should deny unauthenticated access", async () => {
    const res = await makeRequest("GET", "/api/records");
    assert.strictEqual(res.status, 401);
  });
});

describe("Record validation", () => {
  let token;

  before(async () => {
    const res = await makeRequest("POST", "/api/auth/register", {
      name: "Val Test",
      email: `val_${Date.now()}@example.com`,
      password: "val12345",
      role: "admin",
    });
    token = res.body.data.token;
  });

  it("should reject record with negative amount", async () => {
    const res = await makeRequest(
      "POST",
      "/api/records",
      { amount: -500, type: "income", category: "salary", date: "2024-01-01" },
      token
    );
    assert.strictEqual(res.status, 400);
  });

  it("should reject record with invalid type", async () => {
    const res = await makeRequest(
      "POST",
      "/api/records",
      { amount: 500, type: "bonus", category: "salary", date: "2024-01-01" },
      token
    );
    assert.strictEqual(res.status, 400);
  });

  it("should reject record with future date", async () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const res = await makeRequest(
      "POST",
      "/api/records",
      {
        amount: 500,
        type: "income",
        category: "salary",
        date: futureDate.toISOString(),
      },
      token
    );
    assert.strictEqual(res.status, 400);
  });
});

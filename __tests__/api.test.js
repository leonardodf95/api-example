import { describe, it, beforeAll, afterAll, expect, jest } from "@jest/globals";
import { server } from "../src/api.js";

describe("API Users E2E tests suite", () => {
  function waitForServerStatus(server) {
    return new Promise((resolve, reject) => {
      server.once("error", (err) => reject(err));
      server.once("listening", () => resolve());
    });
  }
  let _testServer;
  let _testServerAddress;

  beforeAll(async () => {
    // process.env.NODE_ENV = "test";
    _testServer = server.listen();
    await waitForServerStatus(_testServer);
    const serverInfo = _testServer.address();
    _testServerAddress = `http://localhost:${serverInfo.port}`;
  });
  beforeAll(() => {
    //importante para garantir que o teste não falhe por causa do tempo
    //pois o teste pode ser rodado em anos diferentes
    jest.useFakeTimers({
      now: new Date("2024-09-26T00:00:00Z"),
    });
  });

  function createUser(data) {
    return fetch(`${_testServerAddress}/users`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async function fetchUser(id) {
    return (await fetch(`${_testServerAddress}/users/${id}`)).json();
  }

  afterAll((done) => {
    server.closeAllConnections();
    _testServer.close(done);
  });

  it("it should register a new user an young-adult category", async () => {
    const expectedCategory = "young-adult";
    const response = await createUser({
      name: "Fulano",
      birthDate: "2000-01-01",
    });
    expect(response.status).toBe(201);
    expect(response.headers.get("content-type")).toBe("application/json");
    const result = await response.json();

    expect(result).toEqual(
      expect.objectContaining({
        id: expect.any(String),
      })
    );

    const user = await fetchUser(result.id);
    expect(user.category).toBe(expectedCategory);
  });
  it("it should register a new user an adult category", async () => {
    const expectedCategory = "adult";
    const response = await createUser({
      name: "Beltrano",
      birthDate: "1980-01-01",
    });
    expect(response.status).toBe(201);
    expect(response.headers.get("content-type")).toBe("application/json");
    const result = await response.json();

    expect(result).toEqual(
      expect.objectContaining({
        id: expect.any(String),
      })
    );

    const user = await fetchUser(result.id);
    expect(user.category).toBe(expectedCategory);
  });
  it("it should register a new user an senior category", async () => {
    const expectedCategory = "senior";
    const response = await createUser({
      name: "Sicrano",
      birthDate: "1950-01-01",
    });
    expect(response.status).toBe(201);
    expect(response.headers.get("content-type")).toBe("application/json");
    const result = await response.json();

    expect(result).toEqual(
      expect.objectContaining({
        id: expect.any(String),
      })
    );

    const user = await fetchUser(result.id);
    expect(user.category).toBe(expectedCategory);
  });
  it("should throw an error when registering a under-age new user", async () => {
    const response = await createUser({
      name: "Ciclano",
      birthDate: "2010-01-01",
    });

    expect(response.status).toBe(400);
    expect(response.headers.get("content-type")).toBe("application/json");
    const result = await response.json();
    expect(result.error).toBe("Under-age users are not allowed");
  });

  it("should return 404 when fetching an unregistered user", async () => {
    const response = await fetch(`${_testServerAddress}/users/1234`);
    expect(response.status).toBe(404);
    const result = await response.json();
    expect(result.error).toBe("User not found");
  });
});

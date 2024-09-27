import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { createServer } from "node:http";

const userDb = [];

function getUserCategory(birthDate) {
  const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
  if (age < 18) throw new Error("Under-age users are not allowed");
  if (age <= 25) return "young-adult";
  if (age <= 50) return "adult";
  return "senior";
}

const server = createServer(async (req, res) => {
  try {
    if (req.url === "/users" && req.method === "POST") {
      const user = JSON.parse(await once(req, "data"));
      const updatedUser = {
        ...user,
        id: randomUUID(),
        category: getUserCategory(user.birthDate),
      };
      userDb.push(updatedUser);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          id: updatedUser.id,
        })
      );
      return;
    }
    if (req.url.startsWith("/users") && req.method === "GET") {
      const [, , userId] = req.url.split("/");
      const user = userDb.find((u) => u.id === userId);
      if (!user) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: "User not found" }));
        return;
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(user));
      return;
    }
  } catch (error) {
    if (error.message.includes("Under-age")) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: error.message }));
      return;
    }
    res.writeHead(500);
    res.end('{"error": "Internal server error"}');
  }
});

export { server };

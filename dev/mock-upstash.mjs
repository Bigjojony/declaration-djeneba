// Serveur local qui imite l'API REST Upstash Redis (pour les tests hors ligne).
// Usage : node dev/mock-upstash.mjs   (écoute sur http://127.0.0.1:8079)
import http from "node:http";

const PORT = Number(process.env.MOCK_PORT || 8079);

/** key -> Map(field -> value) */
const hashes = new Map();
/** key -> value */
const strings = new Map();

function hashFor(key) {
  if (!hashes.has(key)) hashes.set(key, new Map());
  return hashes.get(key);
}

function runCommand(cmd) {
  const name = String(cmd[0] || "").toUpperCase();
  const args = cmd.slice(1);
  switch (name) {
    case "PING":
      return "PONG";
    case "HSET": {
      const [key, ...pairs] = args;
      const h = hashFor(key);
      let added = 0;
      for (let i = 0; i < pairs.length; i += 2) {
        if (!h.has(pairs[i])) added++;
        h.set(pairs[i], pairs[i + 1]);
      }
      return added;
    }
    case "HGET": {
      const [key, field] = args;
      return hashes.get(key)?.get(field) ?? null;
    }
    case "HGETALL": {
      const h = hashes.get(args[0]);
      if (!h) return [];
      const flat = [];
      for (const [f, v] of h) flat.push(f, v);
      return flat;
    }
    case "HLEN":
      return hashes.get(args[0])?.size ?? 0;
    case "HDEL": {
      const h = hashes.get(args[0]);
      let n = 0;
      for (const f of args.slice(1)) if (h?.delete(f)) n++;
      return n;
    }
    case "DEL":
      for (const k of args) {
        hashes.delete(k);
        strings.delete(k);
      }
      return 1;
    case "SET":
      strings.set(args[0], args[1]);
      return "OK";
    case "GET":
      return strings.get(args[0]) ?? null;
    case "INCR": {
      const cur = Number(strings.get(args[0]) || 0) + 1;
      strings.set(args[0], String(cur));
      return cur;
    }
    case "EXISTS":
      return args.some((k) => hashes.has(k) || strings.has(k)) ? 1 : 0;
    default:
      return null;
  }
}

const server = http.createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    let parsed;
    try {
      parsed = JSON.parse(body || "[]");
    } catch {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: "bad json" }));
      return;
    }

    const isPipeline =
      Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0]);
    const commands = isPipeline ? parsed : [parsed];

    const results = commands.map((c) => {
      try {
        return { result: runCommand(c) };
      } catch (e) {
        return { error: String(e) };
      }
    });

    const out = isPipeline ? results : results[0];
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify(out));
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`mock Upstash en écoute sur http://127.0.0.1:${PORT}`);
});

import { appRouter } from "./packages/api/src/routers/index";
import { createContext } from "./packages/api/src/context";
import { RPCHandler } from "@orpc/server/fetch";

const rpcHandler = new RPCHandler(appRouter);

// Mock Hono context
const mockHonoContext = {
  req: {
    raw: {
      headers: new Headers(),
    }
  }
} as any;

const context = await createContext({ context: mockHonoContext });

try {
  const request = new Request("http://localhost:3000/api/admin/getPlatformSettings", {
    method: "POST",
    body: JSON.stringify({}),
    headers: {
      "Content-Type": "application/json",
    }
  });

  const { matched, response } = await rpcHandler.handle(request, {
    prefix: "/api",
    context,
  });

  console.log("Matched:", matched);
  console.log("Status:", response?.status);
  if (response?.status !== 200) {
    const body = await response?.json();
    console.log("Body:", JSON.stringify(body, null, 2));
  }
} catch (e) {
  console.error("Error calling handler:", e);
}

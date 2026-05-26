import { NextRequest } from "next/server"
import proxy from "@/proxy"
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth-session"

beforeEach(() => {
  process.env.APTITUDE_SESSION_SECRET = "test-session-secret"
})

async function request(pathname: string, token?: string) {
  return new NextRequest(`http://localhost${pathname}`, {
    headers: token ? { Cookie: `${SESSION_COOKIE_NAME}=${token}` } : undefined,
  })
}

describe("proxy route gating", () => {
  it("lets signed-in users reach the public landing page", async () => {
    const token = await createSessionToken("operator@example.com")

    await expect(proxy(await request("/", token))).resolves.toBeUndefined()
  })

  it("still sends signed-in users away from login to the catalog", async () => {
    const token = await createSessionToken("operator@example.com")

    const res = await proxy(await request("/login", token))

    expect(res?.headers.get("location")).toBe("http://localhost/catalog")
  })

  it("keeps the catalog protected for anonymous users", async () => {
    const res = await proxy(await request("/catalog"))

    expect(res?.headers.get("location")).toBe("http://localhost/login")
  })
})

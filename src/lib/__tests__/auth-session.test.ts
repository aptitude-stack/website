import { createSessionToken, verifySessionToken } from "@/lib/auth-session"

beforeEach(() => {
  process.env.APTITUDE_SESSION_SECRET = "test-session-secret"
})

describe("auth session tokens", () => {
  it("preserves a normalized login email as the session subject", async () => {
    const token = await createSessionToken(" Test1@Example.COM ")

    await expect(verifySessionToken(token)).resolves.toMatchObject({
      sub: "test1@example.com",
    })
  })

  it("keeps different login emails as different session subjects", async () => {
    const first = await verifySessionToken(await createSessionToken("test1@example.com"))
    const second = await verifySessionToken(await createSessionToken("test2@example.com"))

    expect(first?.sub).toBe("test1@example.com")
    expect(second?.sub).toBe("test2@example.com")
  })
})

import { getUptimeHumanReadable } from "./uptime";
describe("Uptime command tests", () => {
  test("getUptimeHumanReadable works as intented", () => {
    expect(getUptimeHumanReadable(10000))
    .toBe("10 seconds")
    expect(getUptimeHumanReadable(10230120))
    .toBe("2 hours, 50 minutes, 30 seconds")
  })
})

import { isLink } from "../../../plugins/linkreflector/plugin";
describe("Plugin tests", () => {
  test("isLink", () => {
    const testCases = [
      "https://www.twitch.tv",
      "check this out!  😀  https://www.google.com/search?q=test&oq=test \n\n",
    ];
    testCases.forEach(testCase => {
      expect(isLink(testCase)).toBe(true);
    });
    expect(isLink("😀 hi")).toBe(false);
  });
})

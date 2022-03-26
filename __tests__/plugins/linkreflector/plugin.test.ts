import { isLink } from "../../../plugins/linkreflector/plugin";
describe("Plugin tests", () => {
  test("isLink", () => {
    const testCases = [
      "https://www.twitch.tv",
      "wow check out thi video wow https://youtu.be/RhrJ9-mir64 wow wow plz archive @Patrick \n\n",
    ];
    testCases.forEach(testCase => {
      expect(isLink(testCase)).toBe(true);
    });
    expect(isLink("😀 hi")).toBe(false);
  });
})

import { ApiInfoActionGroup } from "./apiInfo";

describe("ApiInfoActionGroup", () => {
  let actionGroup: ApiInfoActionGroup;

  beforeEach(() => {
    actionGroup = new ApiInfoActionGroup({});
  });

  it("get", async () => {
    const result = await actionGroup.get();
    expect(result.actionGroups[0]).toEqual({
      name: "apiInfo",
      actions: [{ name: "get" }],
    });
  });
});

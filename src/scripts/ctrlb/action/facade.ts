import { Tab } from "./tab";
import { Bookmark } from "./bookmark";
import { ActionInfo, ActionKind, ResultInfo } from "./action";

// TODO
interface JsonObject {}

interface ActionKindConstructor {
  new (): ActionKind;
}

interface ActionKindConstructors {
  [index: string]: ActionKindConstructor;
}

export class ActionFacade {
  public execute(json: JsonObject): Promise<ResultInfo> {
    const actionInfo = json as ActionInfo;
    const actionKinds: ActionKindConstructors = {
      tab: Tab,
      bookmark: Bookmark
    };
    const actionKindClass = actionKinds[actionInfo.kindName];
    const actionKind = new actionKindClass();
    const result = actionKind.execute(actionInfo.actionName, actionInfo.args);
    if (result instanceof Promise) {
      return result;
    }
    return new Promise((resolve, reject) => resolve(result));
  }
}

// TODO send api info

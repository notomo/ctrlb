import { ActionArgs, ActionKind, ActionGroup, ResultInfo } from "./action";

export class TextToSpeak extends ActionKind {
  protected getActions(): ActionGroup {
    return {
      speak: (args: ActionArgs) => this.speak(args)
    };
  }

  protected async speak(args: ActionArgs): Promise<ResultInfo> {
    const text: string = args.input as string;
    if (text === undefined) {
      return { status: "invalid" };
    }
    var rate: number = args.rate as number;
    if (rate === undefined) {
      rate = 1.0;
    }
    await this.chrome.tts.speak(text, { rate: rate });
    return { status: "ok" };
  }
}

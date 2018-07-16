import { ActionArgs, ActionKind, ActionGroup } from "./action";

export class TextToSpeakKind extends ActionKind {
  protected getActions(): ActionGroup {
    return {
      speak: {
        f: (args: ActionArgs) => {
          const a = this.has(
            { input: this.requiredString, rate: this.optionalNumber },
            args
          );
          return this.speak(a.input, a.rate);
        }
      }
    };
  }

  protected async speak(text: string, rate?: number): Promise<null> {
    const r = rate || 1.0;
    await this.browser.tts.speak(text, { rate: r });
    return null;
  }
}

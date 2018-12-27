import { Extension } from "./setup";
import { Server as WebSocketServer } from "ws";

const wsServer = new WebSocketServer({ port: 8001 });
const extension = new Extension();
wsServer.on("listening", async () => {
  await extension.start();
});

const expectResponse = (
  id: string,
  event: MessageEvent,
  expect: (json: any) => void
): boolean => {
  const jsonString = event.data.toString();
  const json = JSON.parse(jsonString);
  if (json.id !== id) {
    return false;
  }

  console.log(jsonString);
  expect(json);
  return true;
};

describe("api", () => {
  let socket: WebSocket;

  const request = (data: any) => {
    const json = JSON.stringify(data);
    socket.send(json);
  };

  beforeAll(done => {
    wsServer.on("connection", (ws: WebSocket) => {
      socket = ws;
      done();
    });
  }, 10000);

  describe("tab", () => {
    it("tab/listAll returns a tab at the start", async done => {
      socket.onmessage = event => {
        expectResponse("1", event, json => {
          expect(json.body.data.length).toEqual(1);
          done();
        });
      };

      request({ id: "1", method: "tab/listAll", params: {} });
    });

    it("tab/create adds a new tab", async done => {
      socket.onmessage = event => {
        expectResponse("2", event, json => {
          expect(json.body.data.length).toEqual(2);
          expect(json.body.data[1].url).toEqual("about:blank");
          done();
        });
      };

      request({ id: "1", method: "tab/create", params: {} });
      request({ id: "2", method: "tab/listAll", params: {} });
    });
  });

  describe("window", () => {
    it("window/list returns a window at the start", async done => {
      socket.onmessage = event => {
        expectResponse("1", event, json => {
          expect(json.body.data.length).toEqual(1);
          done();
        });
      };

      request({ id: "1", method: "window/list", params: {} });
    });
  });

  describe("tab/zoom", () => {
    it("tab/zoom/get returns 1 at the start", async done => {
      socket.onmessage = event => {
        expectResponse("1", event, json => {
          expect(json.body.data).toEqual(1);
          done();
        });
      };

      request({ id: "1", method: "tab/zoom/get", params: {} });
    });
  });

  afterAll(() => {
    extension.stop();
    wsServer.close();
  });
});

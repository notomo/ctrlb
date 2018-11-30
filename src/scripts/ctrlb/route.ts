import { Di } from "./di";

export const router = Di.get("Router");
const v = Di.get("Validator");

const scroll = Di.get("ScrollActionGroup");
router.add("tab/scroll/up", scroll, scroll.up, [], []);
router.add("tab/scroll/down", scroll, scroll.down, [], []);
router.add("tab/scroll/toTop", scroll, scroll.toTop, [], []);
router.add("tab/scroll/toBottom", scroll, scroll.toBottom, [], []);

const zoom = Di.get("ZoomActionGroup");
router.add("tab/zoom/get", zoom, zoom.get, [v.optionalNumber()], ["id"]);
router.add(
  "tab/zoom/set",
  zoom,
  zoom.set,
  [v.requiredNumber(), v.optionalNumber()],
  ["zoomFactor", "id"]
);
router.add("tab/zoom/up", zoom, zoom.up, [v.optionalNumber()], ["id"]);
router.add("tab/zoom/down", zoom, zoom.down, [v.optionalNumber()], ["id"]);
router.add("tab/zoom/reset", zoom, zoom.reset, [v.optionalNumber()], ["id"]);

const navigation = Di.get("NavigationActionGroup");
router.add("tab/navigation/back", navigation, navigation.back, [], []);
router.add("tab/navigation/forward", navigation, navigation.forward, [], []);

const history = Di.get("HistoryActionGroup");
router.add(
  "history/search",
  history,
  history.search,
  [v.optionalString()],
  ["input"]
);
router.add(
  "history/remove",
  history,
  history.remove,
  [v.requiredString()],
  ["url"]
);

const download = Di.get("DownloadActionGroup");
router.add(
  "download/search",
  download,
  download.search,
  [v.optionalString()],
  ["input"]
);

const event = Di.get("EventActionGroup");
router.add(
  "event/subscribe",
  event,
  event.subscribe,
  [v.eventName()],
  ["eventName"]
);
router.add(
  "event/unsubscribe",
  event,
  event.unsubscribe,
  [v.eventName()],
  ["eventName"]
);

const window = Di.get("WindowActionGroup");
router.add("window/get", window, window.get, [v.requiredNumber()], ["id"]);
router.add("window/maximize", window, window.maximize, [], []);
router.add("window/minimize", window, window.minimize, [], []);
router.add("window/toFullScreen", window, window.toFullScreen, [], []);
router.add("window/toNormal", window, window.toNormal, [], []);
router.add(
  "window/removeLastFocused",
  window,
  window.removeLastFocused,
  [],
  []
);
router.add(
  "window/remove",
  window,
  window.remove,
  [v.requiredNumber()],
  ["id"]
);
router.add(
  "window/activate",
  window,
  window.activate,
  [v.requiredNumber()],
  ["id"]
);
router.add("window/list", window, window.list, [], []);

const bookmark = Di.get("BookmarkActionGroup");
router.add(
  "bookmark/getTree",
  bookmark,
  bookmark.getTree,
  [v.optionalString()],
  ["id"]
);
router.add(
  "bookmark/open",
  bookmark,
  bookmark.open,
  [v.requiredString()],
  ["id"]
);
router.add(
  "bookmark/tabOpen",
  bookmark,
  bookmark.tabOpen,
  [v.requiredString()],
  ["id"]
);
router.add(
  "bookmark/remove",
  bookmark,
  bookmark.remove,
  [v.requiredString()],
  ["id"]
);
router.add(
  "bookmark/list",
  bookmark,
  bookmark.list,
  [v.optionalNumber()],
  ["limit"]
);
router.add(
  "bookmark/search",
  bookmark,
  bookmark.search,
  [v.optionalString()],
  ["input"]
);
router.add(
  "bookmark/create",
  bookmark,
  bookmark.create,
  [v.requiredString(), v.requiredString(), v.requiredString()],
  ["url", "title", "parentId"]
);
router.add(
  "bookmark/update",
  bookmark,
  bookmark.update,
  [v.requiredString(), v.requiredString(), v.requiredString()],
  ["id", "url", "title"]
);

const tab = Di.get("TabActionGroup");
router.add("tab/create", tab, tab.create, [], []);
router.add("tab/first", tab, tab.first, [], []);
router.add("tab/next", tab, tab.next, [], []);
router.add("tab/previous", tab, tab.previous, [], []);
router.add("tab/last", tab, tab.last, [], []);
router.add("tab/moveLeft", tab, tab.moveLeft, [], []);
router.add("tab/moveRight", tab, tab.moveRight, [], []);
router.add("tab/moveFirst", tab, tab.moveFirst, [], []);
router.add("tab/moveLast", tab, tab.moveLast, [], []);
router.add("tab/close", tab, tab.close, [], []);
router.add("tab/closeOthers", tab, tab.closeOthers, [], []);
router.add("tab/closeRight", tab, tab.closeRight, [], []);
router.add("tab/closeLeft", tab, tab.closeLeft, [], []);
router.add("tab/tabOpen", tab, tab.tabOpen, [v.requiredString()], ["url"]);
router.add("tab/open", tab, tab.open, [v.requiredString()], ["url"]);
router.add("tab/duplicate", tab, tab.duplicate, [], []);
router.add("tab/reload", tab, tab.reload, [], []);
router.add("tab/list", tab, tab.list, [], []);
router.add("tab/get", tab, tab.get, [v.requiredNumber()], ["id"]);
router.add("tab/getCurrent", tab, tab.getCurrent, [], []);

router.add("apiInfo/get", router, router.getAll, [], []);

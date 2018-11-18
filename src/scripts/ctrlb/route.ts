import { Di } from "./di";

export const router = Di.get("Router");
const v = Di.get("Validator");

const scroll = Di.get("ScrollActionGroup");
router.add("tab/scroll/up", scroll, scroll.up, [], []);
router.add("tab/scroll/down", scroll, scroll.down, [], []);
router.add("tab/scroll/toTop", scroll, scroll.toTop, [], []);
router.add("tab/scroll/toBottom", scroll, scroll.toBottom, [], []);

const zoom = Di.get("ZoomActionGroup");
router.add("tab/zoom/get", zoom, zoom.get, [], []);
router.add(
  "tab/zoom/set",
  zoom,
  zoom.set,
  [v.requiredNumber()],
  ["zoomFactor"]
);
router.add("tab/zoom/up", zoom, zoom.up, [], []);
router.add("tab/zoom/down", zoom, zoom.down, [], []);
router.add("tab/zoom/reset", zoom, zoom.reset, [], []);

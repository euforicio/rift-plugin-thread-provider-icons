// Thread Provider Icons is a frontend-only feature — the sidebar marks are
// drawn entirely in app.tsx from data the host already hands the plugin. BB
// still requires a server entry, so this one just reports for duty.
import type { BbPluginApi } from "@get-bb/plugin-sdk";

export default async function plugin(bb: BbPluginApi) {
  bb.log.info("loaded — sidebar provider marks are drawn by the app bundle");
}

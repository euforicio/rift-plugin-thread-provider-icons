import { useEffect, useRef, type ComponentType } from "react";
import {
  definePluginApp,
  experimental_useSidebarThreads,
} from "@get-bb/plugin-sdk/app";
import { providerLabel, providerMarkSpec, providerMarkSvg } from "./lib/provider-marks";

const ICON_SIZE = 14;

function injectProviderIcons(threads: readonly { id: string; providerId: string }[]) {
  const byId = new Map(threads.map((thread) => [thread.id, thread.providerId]));
  for (const target of Array.from(document.querySelectorAll("[data-sidebar-thread-id]"))) {
    const id = target.getAttribute("data-sidebar-thread-id");
    if (!id) continue;
    const providerId = byId.get(id);
    if (!providerId) continue;

    // [data-sidebar-thread-id] is an `absolute inset-0` click overlay covering
    // the whole row, so anything drawn inside it stacks on top of the title.
    // The row itself is the flex line; its first <span> child is the title
    // container (`flex min-w-0 flex-1 items-center gap-1.5`), which centers and
    // spaces the mark for us.
    const row = target.parentElement;
    if (!row) continue;
    const container = row.querySelector(":scope > span") as HTMLElement | null;
    if (!container) continue;

    let icon = row.querySelector("[data-thread-provider-icon]") as HTMLElement | null;
    if (icon && icon.parentElement !== container) {
      icon.remove();
      icon = null;
    }
    if (!icon) {
      icon = document.createElement("span");
      icon.dataset.threadProviderIcon = "1";
      icon.style.cssText = `display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;width:${ICON_SIZE}px;height:${ICON_SIZE}px`;
      container.insertBefore(icon, container.firstChild);
    }

    const label = providerLabel(providerId);
    if (icon.dataset.threadProvider !== providerId) {
      icon.dataset.threadProvider = providerId;
      // Host-owned color classes, so the mark matches the provider picker in
      // both themes.
      icon.className = providerMarkSpec(providerId).colorClass;
      icon.innerHTML = providerMarkSvg(providerId, ICON_SIZE);
    }
    if (icon.title !== label) icon.title = label;
  }
}

function SidebarProviderIcons() {
  const { threads } = experimental_useSidebarThreads();
  const threadsRef = useRef(threads);
  threadsRef.current = threads;
  const signature = threads.map((thread) => `${thread.id}:${thread.providerId}`).join(",");

  useEffect(() => {
    let frame = 0;
    let disposed = false;
    const options: MutationObserverInit = { childList: true, subtree: true };

    // injectProviderIcons writes into document.body, which is the same subtree we
    // observe — staying connected across our own writes re-triggers this callback
    // forever and wedges the main thread. Detach while writing, and coalesce on a
    // frame so a burst of sidebar updates yields to the event loop.
    const apply = () => {
      frame = 0;
      if (disposed) return;
      observer.disconnect();
      try {
        injectProviderIcons(threadsRef.current);
      } finally {
        if (!disposed) observer.observe(document.body, options);
      }
    };

    const schedule = () => {
      if (frame || disposed) return;
      frame = window.requestAnimationFrame(apply);
    };

    const observer = new MutationObserver(schedule);
    schedule();
    observer.observe(document.body, options);

    return () => {
      disposed = true;
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [signature]);
  return null;
}

export default definePluginApp((app) => {
  app.slots.experimental_threadList({
    id: "thread-provider-icons",
    title: "Threads",
    description: "Built-in list with provider icons before titles.",
    component: (props) => {
      // The SDK types experimental_Original as a bare ComponentType; it does
      // accept the slot props at runtime.
      const Original = props.experimental_Original as ComponentType<typeof props>;
      return (
        <>
          <SidebarProviderIcons />
          <Original {...props} />
        </>
      );
    },
  });
});

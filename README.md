# Thread Provider Icons

Draws each thread's **provider logo before its title** in the BB sidebar.

When you run threads across Codex, Claude Code, Cursor, opencode, Grok, Pi and
friends, the sidebar is a wall of identical rows. This plugin puts the agent's
own mark in front of every title, in the provider's own brand colour, so you can
tell at a glance who owns which thread.

<!-- screenshot: docs/sidebar.png -->

## What it does

- One 14px provider mark per sidebar row, inserted before the title.
- Brand colours that follow the host theme (light and dark), using the same
  marks and colours as BB's own composer provider picker.
- Any unknown `acp-*` agent falls back to the generic ACP mark and is labelled
  from its provider id, so new agents still get a sensible icon.
- Hover tooltip naming the provider.
- Nothing else. No settings, no background work, no network calls, no storage.

## Install

From the BB marketplace:

```bash
bb plugin install thread-provider-icons
```

Or from a local checkout:

```bash
git clone https://github.com/braedonsaunders/bb-plugin-thread-provider-icons.git
cd bb-plugin-thread-provider-icons
npm install --include=dev
bb plugin install . --yes
```

The icons appear immediately — there is no panel to open and nothing to
configure.

## How it works

BB does not (yet) expose a per-row decorator for the thread list, so the plugin
wraps the built-in list through the `experimental_threadList` slot and renders
the host's original component untouched. Alongside it, a small effect reads
`experimental_useSidebarThreads()` and writes one `<span>` into each
`[data-sidebar-thread-id]` row.

Two details worth knowing if you fork this:

- The `[data-sidebar-thread-id]` element is an `absolute inset-0` click overlay
  covering the whole row, so anything drawn *inside* it stacks on top of the
  title. The mark goes into the row's first `<span>` child — the flex title
  container — which centres and spaces it for free.
- The `MutationObserver` that keeps the marks alive across re-renders watches
  `document.body`, which is the same subtree the injector writes to. It
  disconnects while writing and coalesces on an animation frame; without that,
  it re-triggers itself forever and wedges the main thread.

## Compatibility

Requires BB `>= 0.39` and plugin SDK `>= 0.4.8`. It relies on two experimental
SDK surfaces (`experimental_threadList`, `experimental_useSidebarThreads`) and
on the sidebar's DOM shape, so a BB release that reworks the thread list may
need a matching release here.

If you also run [UltraGoal](https://github.com/braedonsaunders/bb-plugin-ultragoal),
use v0.6.0 or later — earlier versions drew these same marks themselves, and
running both would double up.

## Develop

```bash
npm install --include=dev
bb plugin install .
bb plugin dev
```

## Licence

MIT © Braedon Saunders

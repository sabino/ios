---
{
  "slug": "graphics-stack",
  "title": "A pixel passes through several systems",
  "description": "Drawing, surfaces, presentation and panel scanout deserve separate names and separate tests.",
  "section": "Graphics",
  "order": 12,
  "evidence": [
    "E15",
    "E16",
    "E17",
    "E18"
  ],
  "sources": [
    "S01",
    "S07"
  ],
  "related": [
    "surface-memory",
    "presentation",
    "display-blanking",
    "audio"
  ],
  "updated": "2026-09-29"
}
---

## Start at the producer and follow the bytes

A visible frame can originate in a bootloader, a kernel console, an application renderer or a diagnostic pattern. A photograph alone rarely identifies the producer. The native research therefore follows the chain from original-client surface to descriptor access, presentation buffer and physical scanout. [E17](/ios/evidence/E17/)

The conceptual path is:

**Original userspace → CoreSurface storage → framebuffer client → native presentation service → panel scanout → display engine → panel.**

Rendering creates or updates pixels. Presentation selects and transfers the image that should be shown. Scanout is the device's consumption of the active buffer. These roles can share memory in some designs, but their contracts do not become identical.

## Preserve the original client boundary

The native service retains the original framebuffer-facing class and common client/queue machinery while supplying native hardware behavior. That lets the original userspace request geometry, obtain a surface and submit through its expected interface. A generic service with a plausible name would not be equivalent if the original client never discovered or opened it.

The evidence strengthened in stages: service publication, original-client attachment, valid source memory, copied nondefault surfaces, and finally physical panel observation. Each stage narrowed a different uncertainty. [E15](/ios/evidence/E15/) [E16](/ios/evidence/E16/)

The project also recorded software frame notifications. Calling a notification path does not establish physical vertical blank timing or prove client receipt. Completion, notification and actual presentation require their own observation.

## A black frame has many possible causes

Before reaching the panel, a source can be unallocated, incorrectly mapped, inaccessible to the client, read through an ineffective probe, or overwritten by another owner. Presentation can choose the wrong source or use the wrong stride. After a correct copy, cache visibility or backlight policy can still hide the result.

Finally, the guest can deliberately request black. The recorded SpringBoard trace did exactly that: its dim path requested blanking while the setup image remained in source backing. [E18](/ios/evidence/E18/)

These explanations predict different observations. Inspecting source bytes through a validated path, recording the selected surface, and tracing the blank request is more discriminating than repeatedly capturing the final black screen.

## What setup pixels do—and do not—prove

The physical operator saw a known pattern followed by the original client's setup graphic. Matching source and scanout signatures corroborated that route. This establishes original-client pixels on the real panel for those frames. [E17](/ios/evidence/E17/)

It does not establish a complete PowerVR MBX implementation, Mali acceleration, every OpenGL workload, touch interaction or a generally usable home screen. A setup image may exercise only a subset of the rendering stack.

The next investigation should follow the first concrete failure of the next required workload. Adding a broad GPU subsystem before identifying that boundary risks solving a different problem. The architecture becomes easier to understand when each visual result carries its producer, memory route and presentation scope.

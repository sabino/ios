---
{
  "slug": "presentation",
  "title": "From a guest surface to the PinePhone panel",
  "description": "The physical display milestone combined geometry, visibility, ownership and direct observation.",
  "section": "Graphics",
  "order": 14,
  "evidence": [
    "E16",
    "E17",
    "E29",
    "E33",
    "E35",
    "E37",
    "E43",
    "E50",
    "E51"
  ],
  "sources": [
    "S09",
    "S07"
  ],
  "related": [
    "graphics-stack",
    "surface-memory",
    "display-blanking",
    "touch",
    "camera-preview"
  ],
  "updated": "2026-10-07"
}
---

> **Current edition.** The dated baseline below is retained. The [October 7 systems paper](/ios/paper/) and the update at the end of this chapter describe the newer 3.1.3 frontier.

> **Dated record.** The baseline below describes the 29 September edition. The dated October update later in this chapter records subsequent accepted findings.

## Geometry is part of the interface

The original guest surface is 320 × 480 pixels. The PinePhone panel is 720 × 1440. The measured presentation route expands each guest pixel to a 2 × 2 panel block, producing a 640 × 960 image centered with 40-pixel horizontal margins and 240-pixel vertical margins. [E17](/ios/evidence/E17/)

Those numbers are not merely visual styling. They define the relationship between source stride, destination stride, clipping, scanout extent and eventual touch coordinates. A correct image with a mismatched input transform would still be an unusable interface.

The synthetic copy tests checked differing row strides, padding, guards and rejected invalid layouts. The integrated original-client test then checked an actual selected surface. The physical trial added the panel and its independent memory consumer.

## Visibility needs a physical contract

The display initializer configured the panel before XNU took ownership. The native presentation service reused the reserved active scanout. Its physical mapping and ordering policy made XNU's writes visible to the display engine, while the initializer's earlier cached contents were cleaned at the handoff.

The backlight had to remain on for the trial. A headless power diagnostic that deliberately disabled it would invalidate a visual acceptance test even if every pixel copy succeeded. The publication snapshot establishes the lit-panel trial, not complete backlight policy or suspend/resume.

## Corroborate bytes with appearance

The first known-pattern frames supplied an independent control for the copy route. The original framebuffer client then supplied a nonzero setup surface whose signature matched the corresponding QEMU observation. A later physical run added direct operator confirmation: colored quadrants appeared, followed by the Connect-to-iTunes graphic. [E16](/ios/evidence/E16/) [E17](/ios/evidence/E17/)

The first UART-based gate and the later direct observation are distinct evidence. A signature supports the bytes written to the active buffer; a person seeing the expected image supports the physical presentation route. Neither should silently stand in for the other.

## Clearing a live scanout can create flashes

The display engine consumes the active buffer while the CPU updates it. Clearing that entire buffer before every ordinary copy temporarily exposes a black frame. The recorded correction clears it when necessary and preserves the preceding image between normal swaps.

That change does not suppress a deliberate guest request for a black background. Preserving the old frame unconditionally would hide guest behavior and make the display look stable for the wrong reason. The original queue and completion semantics still govern which image is selected.

## The boundary still open

The observed setup image is a meaningful native milestone. It is not proof of physical VBlank synchronization, tear-free presentation, every pixel format, comprehensive surface teardown or arbitrary rendering workloads. The operator also observed black transitions; later button work established a visible wake response, while the QEMU trace identified one intentional blanking path.

The next stage should continue to connect visible behavior to its originating client action. That makes the port's display history useful as a general case study in separating memory correctness from presentation correctness.

## Reviewed advance: interactive screens and camera content, 1 October 2026

The September setup-frame record remains a setup-frame record. New physical evidence now includes a native N45 home-screen capture from the accepted touch trial, a pixel-identical M68 lock-screen screenshot and an owner-accepted live Camera preview. These extend the visible frontier through separate dated records. [E29](/ios/evidence/E29/) [E33](/ios/evidence/E33/) [E35](/ios/evidence/E35/)

Camera performance shows why presentation terminology still matters. The baseline panel-update counter reports about 30.3 updates per second while the renderer selects about 7.9 distinct camera images per second. Reused images can participate in multiple updates. Neither counter independently measures the precise physical presentation time of each image. [E37](/ios/evidence/E37/)


## Reviewed advance: 3.1.3 and the current frontier, 7 October 2026

The 7E18 interface is 320 × 480, doubled to 640 × 960 and centered inside the 720 × 1440 panel. English lock/home captures are QEMU results; later physical owner acceptance is separate. The idle display timing covers 64 later presentations and zero sampled changes. Its elapsed mean is not animation FPS or pure compositor CPU time. [E43](/ios/evidence/E43/) [E50](/ios/evidence/E50/) [E51](/ios/evidence/E51/)

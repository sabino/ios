---
{
  "slug": "display-blanking",
  "title": "Black can be the requested frame",
  "description": "The dimming investigation separated guest policy from memory failure and panel power.",
  "section": "Graphics",
  "order": 15,
  "evidence": [
    "E18",
    "E17",
    "E20",
    "E45",
    "E51"
  ],
  "sources": [
    "S01"
  ],
  "related": [
    "presentation",
    "buttons",
    "observability"
  ],
  "updated": "2026-10-07"
}
---

> **Current edition.** The dated baseline below is retained. The [October 7 systems paper](/ios/paper/) and the update at the end of this chapter describe the newer 3.1.3 frontier.

## The surface still contained the image

A later QEMU capture found the setup image preserved in the default backing memory while the active scanout was opaque black. The original client had selected no surface and requested a black background. Sampled provider power fields remained enabled. This sharply narrowed the explanation: the visible black was a submitted result, not evidence that the source pixels had vanished. [E18](/ios/evidence/E18/)

A separate caller trace then connected SpringBoard's dimTimerFired path to LayerKit's screen-blanking routine before the black presentation. That observation identifies a specific policy action in a specific run.

It should not be generalized to every black frame. The phone had also exposed possible presentation flashes, and its later-frame instrumentation was limited. A matching visual symptom is a useful hypothesis, not a substitute for the missing trace.

## Three states that look similar from a distance

| State | Potential visible appearance | Discriminating observation |
| --- | --- | --- |
| Guest requests black pixels | Black panel, possibly still backlit | Selected surface and background request |
| Backlight turns off | Dark panel | Backlight control and visible illumination |
| System stops making progress | Last frame or black | Independent liveness and controlled response |

Idle CPU residency is another distinct quantity. A CPU can be mostly idle while the compositor and event system remain healthy. A backlit black panel can consume power even though the guest has blanked its content.

This is why a screen photograph, a heartbeat and a framebuffer dump answer different questions. Combining them is useful; collapsing them into one “sleep” label is not.

## Test the normal wake path

The cleanest next discriminator was a guest input event. If the original HID path receives a valid press and release and the original client selects a nonblack frame, that supports the intended interaction between input policy and presentation.

The committed button work passed that test in the partial model and then on the physical phone. Three short physical taps produced setup image, black, setup image with corresponding HID edges. [E20](/ios/evidence/E20/)

This result supports waking and blanking the observed setup display. It does not establish deep suspend/resume, lock-screen navigation, touch, or every long-press behavior.

## Preserve the distinction in future experiments

A tempting diagnostic shortcut is to force the last nonblack image to remain visible. That may help identify where pixels exist, but it must be labeled as an observation override. It would not validate the guest's own dim/wake behavior.

A better final acceptance records the guest request, resulting surface selection, visible frame and input response. The background should turn black when the client requests it; the device's power policy can then be tested independently.

This investigation is a useful preservation result because it recovers a behavior, not just a picture. The original operating system is making a timed presentation decision, and the native adaptation must preserve enough of the event path for the user to reverse it.


## Reviewed advance: 3.1.3 and the current frontier, 7 October 2026

The 7E18 daily hand test accepts Power blank/wake and complete Power-slider shutdown staying off for thirty seconds. Those are separate transitions; blanking does not establish whole-system suspend, and a transmitted PMIC request alone does not prove actual power-off. Earlier 4A102 fade measurements retain their original record. [E45](/ios/evidence/E45/) [E51](/ios/evidence/E51/)

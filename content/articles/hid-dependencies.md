---
{
  "slug": "hid-dependencies",
  "title": "An absent sensor was blocking the event system",
  "description": "A controlled absence declaration revealed how HID startup waits for service registration.",
  "section": "Interaction",
  "order": 16,
  "evidence": [
    "E19",
    "E20"
  ],
  "sources": [
    "S11"
  ],
  "related": [
    "iokit-discovery",
    "buttons",
    "audio"
  ],
  "updated": "2026-09-29"
}
---

## Follow the thread that signals readiness

The first useful SpringBoard snapshot showed the main thread waiting during HID session initialization. That alone did not identify the cause. A waiting main thread may be normal while a worker performs startup work. The critical question was which worker would eventually signal readiness and what it was doing. [E19](/ios/evidence/E19/)

Read-only user-stack capture connected the HID registration worker to a legacy ambient-light-sensor open through IOKit. Its kernel-side call waited on the old shared IIC controller path. The worker signaled readiness only after registration calls returned.

This established a dependency chain from a peripheral declaration to application startup. It did not prove that a particular physical sensor register was failing, or even that the pending operation reached the intended hardware.

## Advertising a device is a promise

The legacy sensor could register from its tree node without first demonstrating a successful transaction. On the native board, that declaration invited the original client to wait on hardware that was not actually implemented.

A narrowly controlled tree change omitted exactly that unavailable sensor and preserved the remaining baseline. With the same observation window, the main thread left the readiness wait and reached its event loop. The HID worker also completed registration and reached its own run loop. [E19](/ios/evidence/E19/)

The interpretation is limited but useful: the old advertised sensor path blocked readiness in the measured baseline, and declaring its absence removed that wait. No fabricated sensor reading was needed to make the trace look successful.

## Absence is not replacement

The PinePhone has its own light/proximity hardware. A Linux driver and board tree provide references for a later native implementation, but they do not supply a drop-in XNU service. Compatible names in a board tree also need to be distinguished from a measured chip identity.

The project therefore treats the absence control and a physical sensor driver as separate milestones. The former establishes a startup policy for unavailable hardware. The latter would need real acquisition, units, timing, error behavior and original-client integration.

The same discipline applies to audio, power functions and display enable services. A replacement should either provide the promised behavior or expose a supported absence. Returning success without that behavior can move the failure into a less observable part of the system.

## Event loops are not interaction tests

Reaching a CoreFoundation or Mach-message wait is evidence of startup progress. It does not establish that a physical event reaches the application or that the application responds. The later button work independently demonstrated the event path through original HID and a visible wake/blank sequence. [E20](/ios/evidence/E20/)

This gives a useful two-stage acceptance pattern: first establish service readiness, then establish a controlled input and independently observable response. It keeps a quiet event loop from being mistaken for either a frozen application or a fully working user interface.

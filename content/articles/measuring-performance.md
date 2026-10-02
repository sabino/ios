---
{
  "slug": "measuring-performance",
  "title": "Measure the work, then name the improvement",
  "description": "What the atomic-trap and camera experiments can support about responsiveness.",
  "section": "Method",
  "order": 30,
  "evidence": [
    "E37",
    "E38",
    "E39"
  ],
  "sources": [
    "S06",
    "S07"
  ],
  "related": [
    "cpu-compatibility",
    "time-and-interrupts",
    "camera-preview",
    "frame-retirement",
    "observability",
    "power"
  ],
  "updated": "2026-10-01"
}
---
## A local win needs a local name

The native port runs an older userspace on a different CPU and board. A compatibility path can be correct enough to progress while imposing substantial overhead. Finding such a path is useful, but the measured unit determines the claim. A reduction in exceptions is an exception-rate result. It becomes an application-speed result only when application behavior is measured too.

The physical atomic-hotspot experiment supplies both kinds of observation. One paired OFF/ON replay exercised unlock, Settings, list scrolling and Photos. Mean legacy atomic trap rates fell by 98.50–99.91% across the four windows. That is a large, measured reduction in compatibility overhead. [E39](/ios/evidence/E39/)

Mean frame gaps moved differently: approximately −5.96% for unlock, −1.83% for Settings, +0.16% for scrolling and +5.29% for Photos. Two windows improved and two worsened. The report therefore does not establish a consistent UI timing improvement. It also does not show a 99% faster application or a frame-rate multiplier. [E39](/ios/evidence/E39/)

## Keep the measurement’s blind spots visible

These gaps include intentional pauses in the interaction sequence. They are not app-open latency or animation FPS. The runs have different accepted sample counts, and UART interleaving damaged some gap rows. The retained method rejects malformed rows and excludes samples crossing marked phases instead of quietly treating them as ordinary observations.

Only one pair was completed. Repeated trials, randomized order and cache-state controls would help distinguish a stable effect from run order or startup variation. The owner’s reported cold-start slowdown remains unresolved. Lower trap counts do not explain every delay merely because they are easier to count. [E39](/ios/evidence/E39/)

## Camera counters repeat the same lesson

The accepted camera baseline delivered 29.507 native frames per second, selected 7.904 distinct renderer images per second and recorded 30.263 panel updates per second. Each number can be correct because each counts different work. Reusing an image lets a display path keep updating without supplying a fresh camera view at the same rate. [E37](/ios/evidence/E37/)

The queue replay then changed capacity and retention in an isolated environment. It reproduced low selection rates with the smaller queue and removed admission drops in selected larger-queue scenarios. That is strong evidence for a bookkeeping hypothesis, with explicit exclusions: no sensor, pixel-rendering workload, scheduler or physical scanout. Its rate must remain labeled synthetic. [E38](/ios/evidence/E38/)

## Build the next comparison around the claim

For startup responsiveness, measure a defined trigger through a visible ready state over repeated matched boots. For a viewfinder, distinguish delivery, admission, distinct selection and presentation timing. For power, sample battery-side balance during the actual workload instead of relying on a charging icon.

The common discipline is to name the environment, workload, interval and rejected data alongside the result. This lets a real local improvement remain useful without expanding it into an unsupported claim about the whole system.

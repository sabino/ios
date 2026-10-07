---
{
  "slug": "frame-retirement",
  "title": "An image stays owned after it is selected",
  "description": "Queue capacity, display-page reuse and the producer reserve behind a camera bottleneck.",
  "section": "Graphics",
  "order": 28,
  "evidence": [
    "E35",
    "E37",
    "E38",
    "E44",
    "E59"
  ],
  "sources": [
    "S21"
  ],
  "related": [
    "surface-memory",
    "camera-preview",
    "async-storage",
    "measuring-performance",
    "camera-stills"
  ],
  "updated": "2026-10-07"
}
---

> **Current edition.** The dated baseline below is retained. The [October 7 systems paper](/ios/paper/) and the update at the end of this chapter describe the newer 3.1.3 frontier.
## A queue entry is a lifetime commitment

The accepted Camera baseline exposed a useful mismatch: the producer delivered close to thirty frames each second, while the renderer selected fewer than eight distinct images per second. Many submissions were rejected before becoming selectable. Looking only at sensor timing would miss the boundary at which those frames disappeared. [E37](/ios/evidence/E37/)

The reviewed bookkeeping uses two queue entries alongside three display pages. Selecting an image records that the renderer may still use its pixels. Repeated selections refresh that last-use relationship. Completion advances through display-page reuse, so the queue cannot always release an older camera image immediately after selecting a new one. Capacity and retirement are therefore coupled.

This resembles the storage completion lesson elsewhere in the atlas: a callback name is not enough to determine when an object can be reused. The camera surface must remain valid until the consumer’s ownership ends. A producer that overwrites retained pixels could appear faster while violating the contract that makes those pixels meaningful.

## A controlled replay changes one relationship

The isolated experiment executed original ARM queue and display bookkeeping using synthetic bitmap identities. Allocation, locks, clocks, shared-memory service and framebuffer calls were supplied by the test boundary. Sensor capture, pixel rendering, the kernel scheduler and the physical panel were absent. The experiment is therefore classified as a synthetic probe even though it executes original bookkeeping instructions. [E38](/ios/evidence/E38/)

Across 400 input frames, two entries and three display pages accepted 135 frames without timestamp lag, or 103 with the modeled 33.333 ms lag. Those scenarios selected approximately 9.915 and 7.584 distinct images per second. With six entries, both scenarios accepted all 400 and approached 29.452 selections per second. This reproduces the direction and approximate scale of the observed bottleneck without proving that the phone has exactly the modeled lag. [E38](/ios/evidence/E38/)

## More retention can also stop the producer

Increasing downstream capacity is not sufficient if it consumes every available input surface. The generated-helper controls retained a pool of six surfaces but limited the number in flight to five. One remains available for a new capture. An unreserved control demonstrated producer starvation under longer retention, while the revised policy preserved completion checks and drained its buffers in the isolated scenarios. [E38](/ios/evidence/E38/)

The useful design principle is to account for every owner and reserve enough capacity for forward progress. It is not a rule that all queues should have six entries. That number belongs to the measured pool, renderer behavior and selected experiment.

At the pinned publication revision, physical comparison of the larger queue was still pending. Host tests and a passing QEMU boot establish valuable safeguards but cannot supply the missing camera-performance result. A later record must show distinct-image improvement on the phone, preserved ownership and storage checks together. The earlier baseline remains available for comparison.


## Reviewed advance: 3.1.3 and the current frontier, 7 October 2026

The formerly pending larger-queue candidate now has a separate physical 4A102 comparison. Six slots reduce queue pressure and increase selected-image rate in that one pair; selection does not prove individual physical frame presentation. The 7E18 camera retains exclusive capture-ring and destination ownership with stock completions, but no measured 7E18 rate is inferred from the older comparison. [E44](/ios/evidence/E44/) [E59](/ios/evidence/E59/)

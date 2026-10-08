---
{
  "slug": "camera-preview",
  "title": "A live viewfinder has more than one frame rate",
  "description": "Track native delivery, image selection and panel updates without confusing their counters.",
  "section": "Graphics",
  "order": 27,
  "evidence": [
    "E34",
    "E35",
    "E37",
    "E38",
    "E44",
    "E51",
    "E59"
  ],
  "sources": [
    "S19",
    "S20",
    "S21"
  ],
  "related": [
    "camera-capture",
    "surface-memory",
    "presentation",
    "frame-retirement",
    "measuring-performance"
  ],
  "updated": "2026-10-07"
}
---

> **Current edition.** The dated baseline below is retained. The [October 7 systems paper](/ios/paper/) and the update at the end of this chapter describe the newer 3.1.3 frontier.
## The visible milestone

The accepted seventh physical Camera trial displayed a live scene through the original M68AP application. The owner confirmed orientation and exposure, and the native path delivered 1,561 frames without a bridge failure. Memory guards and shutdown checks passed, the phone returned through clean reboot, and eight protected storage hashes remained unchanged. This is application preview acceptance, beyond the earlier raw DMA frame. [E35](/ios/evidence/E35/)

The result does not have one interchangeable “fps” value. Several parts of the system can advance while the same camera image remains visible. A useful performance description names the boundary, the numerator and the measured interval.

| Boundary in the reviewed baseline | Recorded rate | What advances |
| --- | --- | --- |
| Native delivery | 29.507 per second | Newly delivered camera frames |
| Distinct renderer selection | 7.904 per second | Different camera images selected for rendering |
| Panel-update counter | 30.263 per second | Display-path updates, including reused images |

The measurements belong to the accepted baseline, not to every later build or scene. A counter at the display interface is not a synchronized optical measurement of the physical panel. In particular, the renderer-selection counter does not prove the exact instant each selected image appears on the panel. [E37](/ios/evidence/E37/)

## Why a fast producer can feed a slower view

The baseline submitted 1,555 images to the measured queue: 417 were accepted and 1,138 dropped. The renderer selected 414 distinct images and used selected content in 1,591 render calls. Reusing an image is not automatically an error; a compositor can update other content or revisit the same surface. But it means a panel-update count cannot certify fresh camera content at that rate. [E37](/ios/evidence/E37/)

The next investigation followed ownership. The camera producer, shared image surface, image queue, software renderer and reused display page have different lifetimes. An image that has been selected can still be in use. Freeing it as soon as a newer frame arrives would trade a throughput problem for corrupted or racing pixels.

An isolated replay of the original ARM bookkeeping reproduced a strong dependency on queue capacity and display-page retirement. That experiment supports a specific bottleneck hypothesis. It does not model sensor timing, pixel conversion, CPU scheduling or scanout, so its near-30 selections per second cannot be advertised as measured phone performance. [E38](/ios/evidence/E38/)

## Keep the snapshot explicit

At the reviewed source revision, the larger-queue candidate had passed host, isolated ARM and QEMU controls; its physical performance comparison remained pending. Later live-session reports are leads for a subsequent reviewed record. This edition preserves the measured baseline instead of silently replacing it with an in-progress number.

The next decisive comparison needs matched scene and sensor geometry, separate admission failures, image insertion and selection timestamps, retirement observations and the usual shutdown and storage checks. Still saving is a different acceptance path and is described in its own chapter.


## Reviewed advance: 3.1.3 and the current frontier, 7 October 2026

The retained 1.1.4 queue comparison is now physically measured: distinct selected images change from 7.893 to 16.520/s with two versus six slots. Native delivery and panel update counters measure different boundaries, and sampling windows are unequal. The current 3.1.3 stock preview is owner accepted through its clean provider path, but its preview frame rate is unmeasured. Do not transfer the legacy rates to 7E18. [E44](/ios/evidence/E44/) [E51](/ios/evidence/E51/) [E59](/ios/evidence/E59/)

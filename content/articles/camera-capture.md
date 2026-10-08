---
{
  "slug": "camera-capture",
  "title": "From sensor identity to useful camera pixels",
  "description": "Why identifying the OV5640, transferring a frame and exposing a scene are different milestones.",
  "section": "Interaction",
  "order": 26,
  "evidence": [
    "E34",
    "E35",
    "E36",
    "E44",
    "E49",
    "E51"
  ],
  "sources": [
    "S09",
    "S10",
    "S11",
    "S19",
    "S20"
  ],
  "related": [
    "native-iphone",
    "mmu-and-caches",
    "camera-preview",
    "camera-stills"
  ],
  "updated": "2026-10-07"
}
---

> **Current edition.** The dated baseline below is retained. The [October 7 systems paper](/ios/paper/) and the update at the end of this chapter describe the newer 3.1.3 frontier.
## Start with the boundary being measured

A camera bring-up crosses several independent boundaries: the sensor must respond, its output must reach memory, the bytes must describe the intended pixel format, and a consumer must display or save them. A successful identity read is a useful first receipt. It does not establish a frame transfer. A changing buffer is stronger, but it still does not prove that a person can recognize the scene.

The reviewed native capture used the PinePhone’s rear OV5640 in a 640 × 480 UYVY mode. UYVY packs a pair of pixels into four bytes, sharing chroma between the two luma samples. At this geometry, the recorded row stride is 1,280 bytes. The [Linux format reference](/ios/sources/#S20) explains the byte arrangement; the native experiment separately establishes that the device actually produced the captured data. [E34](/ios/evidence/E34/)

## The first accepted frame was dark

The initial buffer was prefilled so the observer could detect rows that the capture never replaced. The accepted frame left zero unchanged sentinel rows, kept its guard regions intact and used the real sensor with its test pattern disabled. One startup completion was discarded before accepting the measured transfer. These controls address incomplete DMA, overwrite and synthetic-content explanations.

Yet the frame’s luma ranged only from 2 to 6. Its mean was approximately 3.982 on the reported byte scale. That is a valid but very dark transfer. It cannot support a claim of useful exposure, calibrated color or a recognizable viewfinder. The record explicitly excludes display, BGRA conversion, the Camera application and the image-queue bridge from this initial acceptance. [E34](/ios/evidence/E34/)

The storage control was also specific. Guest volumes remained read-only and eight compared hashes stayed unchanged. No new full filesystem check ran after this capture; the record relies on earlier clean checks plus unchanged bytes. Reporting a fresh fsck here would add a test that did not happen.

## Follow the pixels into their consumers

Later physical trials crossed the application boundary. The owner accepted an upright, correctly exposed live preview inside the original Camera application. That result has its own delivery, renderer, memory-guard and restoration observations. Its measured image-selection rate remains distinct from native capture throughput. [E35](/ios/evidence/E35/)

Still capture crossed another boundary: the original application saved genuine VGA JPEGs and thumbnails, then resumed preview. A fresh boot reopened the files without changing their hashes. The public photograph in that record comes from the actual sensor and remains unchanged; it is not a generated demonstration of how the camera might look. [E36](/ios/evidence/E36/)

The sensor’s advertised maximum resolution is not the accepted mode. The pinned [OV5640 driver reference](/ios/sources/#S19) documents a wider family of sensor modes, but those public capabilities do not validate their use in this native port. Higher-resolution stills, broader exposure coverage and long-running camera reliability remain separate work.


## Reviewed advance: 3.1.3 and the current frontier, 7 October 2026

7E18 accepts real OV5640 acquisition through stock H1ISP/IOSurface and the original kernel JPEG endpoint. Tow-Boot’s inherited 2.8 V analog rail is verified/adopted under a masked ownership policy. The stock 1600 × 1200 still remains resampled from 640 × 480 acquisition. Human preview/shutter/Photos and later cold-power-cycle persistence are distinct hand-test records. [E44](/ios/evidence/E44/) [E49](/ios/evidence/E49/) [E51](/ios/evidence/E51/)

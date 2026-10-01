# October research reconciliation

The reviewed implementation snapshot is `ec07dd0fedd12c0e00bd1052388235cbfda18de4`. This report reconciles completed records with the atlas. It is an editorial audit of privately retained experiments, not an independent repetition of their physical tests. The research checkout and running experiment sessions were inspected read-only; no build, device run, source modification or message to those sessions was performed.

## Accepted behavior and its evidence

| Capability | What the reviewed record establishes | Limit retained | Atlas record |
| --- | --- | --- | --- |
| Native N45 interaction | Unlock, Settings, visible pinch on an offline fixture, brightness and blank/wake | Two-contact counts alone did not prove pinch; broader app/gesture coverage remains open | E29 |
| Battery UI contract | Original consumer sees controlled charge/discharge/full states | QEMU values are synthetic | E30 |
| Native power state | Read-only AXP803 measurements and power-source publication | Bright initial screen discharges despite USB; temperature and heavy-load endurance unvalidated | E31 |
| Separate M68 profile | Home unlock, Settings and Photos touch, clean reboot, preserved N45 volumes | Prepared preservation profile; no cellular-service acceptance | E32 |
| Screenshot | One stock 320 × 480 TIFF; pixel-identical extracted PNG | Reported pause unmeasured; no gallery-visibility acceptance in this trial | E33 |
| First camera DMA | Real VGA UYVY transfer, intact guards, no unchanged sentinel rows | Dark luma 2–6; no preview or save in this early trial | E34 |
| Camera preview | Owner-accepted live upright/exposed image; 1,561 delivered frames and zero bridge failures | Native delivery and distinct selection differ; no optical presentation timing | E35 |
| Camera stills | Two VGA JPEGs plus thumbnails; preview resumes; both files reopen unchanged after fresh boot | First image initially appeared black; higher resolution and power-loss safety open | E36 |
| Physical preview baseline | 29.507 native deliveries/s, 7.904 distinct selections/s, 30.263 panel updates/s | Counters measure different boundaries | E37 |
| Queue investigation | Original ARM bookkeeping reproduces capacity/retirement effects | Synthetic identities and stubbed services; no pixel workload or physical result | E38 |
| Atomic hotspot | Mean trap rate falls 98.50–99.91% in one physical OFF/ON pair | No consistent mean frame-gap improvement or app-speed multiplier | E39 |
| Recovery | QEMU panic/stall controls plus normal physical petting and clean reboot | No guarantee for every physical hang or automatic thermal/battery supervision | E40 |

## Corrections to the previous capability page

The earlier E17 pixel record did not justify an interactive-home claim. E23's recovery-bracketed battery observation did not establish the later native power-source publication. Those old records remain unchanged; new capabilities now cite the matching later records. The PinePhone includes a cellular modem, so telephony is planned integration rather than a hardware impossibility. The status counters describe bounded acceptance labels, not a percentage of a complete phone.

The latest committed camera-performance record still marks the physical larger-queue comparison pending. The running session discussed newer experiments, but no completed committed acceptance record at the selected revision supported promoting those numbers. The edition preserves the 7.904/s baseline and identifies the next gate. Likewise, an old summary saying Camera integration remained open is interpreted as an earlier milestone when later committed acceptance records establish preview and saving; the earlier result is not silently rewritten.

## Provenance and capture review

All new JSON selections are copied from explicit fields at the pinned revision. Notebook excerpts have bounded line/sentence locators. Full-source SHA-256 values identify the reviewed files. E29 additionally includes selected fields from the extraction manifest; its data-volume digest agrees with the trial notebook and its PNG hash matches the published asset.

The three added captures were inspected visually and for metadata. Both PNGs have no embedded metadata. The JPEG has stock make/model, orientation, size, color-space and guest-date fields; it has no GPS entries or personal/device identifiers. Its original bytes and orientation are retained. The image shows a small robot model and no readable personal material. Captions explicitly reject the metadata's software identity as proof of physical camera hardware and the guest date as a wall-clock capture date.

Historical E01–E28 payloads compare equal with the preceding atlas commit after excluding the newly added `sourceRevision` field. The new edition uses a separate revision for E29–E40. No firmware, binary patch, storage image, implementation source, full log or session transcript was imported.

Public references give architectural context. The pinned OV5640 Linux source and V4L2 format documentation explain modes and bytes; Apple's kernel overview supports the broad kernel/userspace wireframe. They do not independently verify the private experiments.

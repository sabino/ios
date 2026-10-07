---
{
  "slug": "hfs-integrity",
  "title": "Persistence is a ladder of evidence",
  "description": "A completed write, a clean bit and a durable application setting are different results.",
  "section": "Storage",
  "order": 11,
  "evidence": [
    "E12",
    "E13",
    "E14",
    "E25",
    "E29",
    "E36",
    "E40",
    "E44",
    "E45",
    "E47",
    "E51"
  ],
  "sources": [
    "S05"
  ],
  "related": [
    "async-storage",
    "observability",
    "preservation-method",
    "camera-stills"
  ],
  "updated": "2026-10-07"
}
---

> **Current edition.** The dated baseline below is retained. The [October 7 systems paper](/ios/paper/) and the update at the end of this chapter describe the newer 3.1.3 frontier.

> **Dated record.** The baseline below describes the 29 September edition. The dated October update later in this chapter records subsequent accepted findings.

## Begin with a precise persistence claim

A controller can return a sector correctly without the filesystem being healthy. A filesystem can mount without userspace starting. A data volume can pass fsck after a clean reboot without proving survival of arbitrary power loss. These are not rhetorical caveats; the project encountered the boundaries separately. [E12](/ios/evidence/E12/)

The useful progression is:

1. The controller reports completion and a direct read returns the expected sector.
2. A separate process or recovery environment reads the saved bytes.
3. The original filesystem exposes the intended file after synchronization and reboot.
4. A complete consistency check accepts the resulting volume.
5. The original application restores its setting in a new session.
6. A separately designed interruption experiment establishes a stated power-loss property.

Evidence at a lower step should remain valuable without being promoted to a higher one.

<figure class="research-figure">
<img src="/ios/figures/persistence-ladder.svg" alt="Stronger claims need more evidence: The filesystem is recognized. Does not establish a healthy writable volume.. A written file survives a reset. A narrow persistence observation.. Recovery examines the whole volume. Still bounded by the workload and run length." width="440" height="568" loading="lazy" />
<figcaption>A ladder of acceptance claims. A later check strengthens a bounded observation; it does not prove all future workloads.</figcaption>
</figure>

## Read-only is a policy with several surfaces

An early mount listing described the root as read-only while storage-level metadata writes were observed or rejected. A mount label alone did not describe every route that could reach the provider. The later partition-level policy kept root writes outside the allowed path while permitting data writes. [E14](/ios/evidence/E14/)

This distinction explains why the atlas reports both logical mount state and independent root hashes. The root hash is a concrete postcondition about the bytes that were checked. It does not identify every attempted write or prove why a request was issued.

The native work keeps the original filesystem implementation. Replacing the storage provider does not make the host responsible for interpreting all HFS structures, but it does make request status, ordering and synchronization part of the compatibility contract.

## A clean bit is not a full check

A volume-header flag records a state claim. It does not enumerate the consistency of catalogs, allocation maps or directory counts. The research retained cases where a clean-looking state was insufficient and performed full read-only checks on complete recovery copies.

Obtaining those copies before a desktop automount matters. A host filesystem driver may replay or modify metadata, making it harder to attribute a later difference. The decisive storage controls used a recovery transfer before host mass-storage access and verified the copy's identity. [E13](/ios/evidence/E13/)

Repairs also change the experiment. A disposable repaired copy can test whether a checker accepts a corrected structure. It cannot make the preceding damaged run successful. A report should retain both states and identify which image was booted next.

## What the accepted runs establish

Two consecutive corrected physical runs passed their bounded storage and clean-reboot checks. Later UART-requested reboot trials also returned to recovery with a full data check and unchanged root. [E13](/ios/evidence/E13/) [E25](/ios/evidence/E25/)

The QEMU file experiment adds a different result: explicit guest synchronization, guest reset and fresh-process readback of a known file with data checks passing. [E14](/ios/evidence/E14/)

Together, these results justify continued native interaction work. They leave application-setting persistence and arbitrary power interruption as separate acceptance gates. A reference guide should preserve that separation so future readers can choose the evidence appropriate to their own claim.

## Connect volume geometry to a checked boundary

The root-mount record describes a 293,588,992-byte HFSX volume with 4,096-byte allocation blocks and 71,677 total blocks:

```text
71,677 × 4,096 bytes = 293,588,992 bytes
(575,463 − 2,048 + 1) × 512 bytes = 293,588,992 bytes
```

These two independent units—filesystem blocks and disk sectors—describe the same extent in [E12](/ios/evidence/E12/#volume-geometry). They do not establish that a later write is persistent. The [physical run table](/ios/evidence/E13/#consecutive-runs) and [47-byte readback sequence](/ios/evidence/E14/#persistence-stages) supply separate liveness and integrity receipts. Keep the disk extent, mounted object and backing file identities distinct.

## Reviewed advance: settings and photographs, 1 October 2026

The physical interaction record retains Auto-Lock preferences across a clean reboot. The later Camera record goes further: two VGA JPEGs and thumbnails were saved, then the same JPEG hashes were recovered after a fresh boot with no new still requests. The owner accepted their display in the gallery. [E29](/ios/evidence/E29/) [E36](/ios/evidence/E36/)

Both still-saving runs produced full 512 MiB data copies, clean bits and read-only fsck exit 0, with nine protected regions unchanged. This is an exercised application-persistence path, beyond a changed sector or mounted volume. It remains bounded to orderly reboot; it does not establish arbitrary power-loss durability.

The production watchdog also has deliberate emulator panic and shutdown-stall controls. Physical normal petting and clean reboot do not prove recovery from every physical hang. Keep orderly unmount, filesystem validation and fallback reset as separate properties. [E40](/ios/evidence/E40/)


## Reviewed advance: 3.1.3 and the current frontier, 7 October 2026

The first clean 3.1.3 Camera acceptance is followed by a retained shutdown failure and narrowly bounded private-data recovery; it is not an initially clean shutdown claim. Later Power-slider halt and the October 7 daily trial pass fresh root/data filesystem checks. The daily photo reopens after cold power-on. Unlike the older VGA pair, no pre-reboot digest exists for the first successful 7E18 JPEG, so byte-identical before/after persistence is not asserted. [E44](/ios/evidence/E44/) [E45](/ios/evidence/E45/) [E47](/ios/evidence/E47/) [E51](/ios/evidence/E51/)

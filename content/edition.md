---
{
  "title": "Edition 2.0 — a physical 3.1.3 workflow",
  "description": "The 7 October 2026 publication snapshot, its new evidence, retained history and remaining acceptance boundaries."
}
---

## The publication boundary

Edition 2.0 is reviewed on **7 October 2026** at source revision `15b3a954f6d81eb858d0c11f372a8ae1e29d0788`. It covers the shared 4A102/7E18 adaptation, physical 3.1.3 acceptance, recovery and USB work through the committed listener diagnostic. Later live-session candidates are outside this snapshot.

The publication adds the [systems paper](/ios/paper/), a [plain-language summary](/ios/summary/) and the [claims ledger](/ios/claims/). Felipe Guilherme Sabino is the author; the paper states how AI assistance participated in engineering and preparation.

## New reviewed results

- Shared kernel-hash-selected adapter bindings for 1.1.4 and 3.1.3, with build-specific service and memory contracts. [E41](/ios/evidence/E41/)
- Stock 3.1.3 Camera/Photos through original kernel providers, with zero Apple userland instruction changes in the accepted clean route. The 1600 × 1200 still is resampled from 640 × 480 acquisition. [E44](/ios/evidence/E44/)
- Daily owner acceptance of touch, battery indication, Camera, complete power-off and reopening a new photo after cold power-on. Ordinary restart remains a separate gate. [E51](/ios/evidence/E51/)
- A physical selector, protected AHVBOOT growth, SD-free eMMC boot and bounded RTC recovery. The selector’s accepted back-buffer controls and later styling candidate remain separate. [E47](/ios/evidence/E47/) [E48](/ios/evidence/E48/) [E61](/ios/evidence/E61/)
- An idle display timing baseline, finite real accelerometer samples and a measured legacy preview queue comparison. No 3.1.3 frame-rate extrapolation is made. [E50](/ios/evidence/E50/) [E55](/ios/evidence/E55/) [E59](/ios/evidence/E59/)
- USB enumeration and stock mux progress, a failed fixed-delay trial and later sampled listener timing. Pairing, information/syslog/AFC services and listener-gated admission remain pending. [E52](/ios/evidence/E52/) [E53](/ios/evidence/E53/) [E54](/ios/evidence/E54/)
- A configured São Paulo time zone whose visible owner clock check remains pending, and an offline next-target ranking with a separate partial iOS 6 QEMU frontier. [E57](/ios/evidence/E57/) [E58](/ios/evidence/E58/) [E62](/ios/evidence/E62/)

## History is retained

E01–E40 retain their original payloads, review dates and source revisions. New records identify later experiments; they do not silently replace historical observations. Existing chapters receive explicitly dated October 7 updates. The camera queue candidate that was pending in edition 1.2 now has a separate physical comparison in E59. The original failed USB enumeration checkpoint stays false inside E52, beside the later passed mux trial.

The correction ledger also preserves the distinction between a running daemon and a ready listener, a file’s output dimensions and captured detail, a reset marker and actual reset, and selected image rates versus panel update counters. The research timeline remains a chronology of named reports rather than one continuous experiment.

## Media and access

Three selected 3.1.3 captures are added with source basenames, SHA-256 and full-image bounds. Original bytes and pixels are preserved. QEMU lock/home captures and the stock Camera screenshot recovered from physical storage have different labels. No selector panel photograph is claimed where the source record contains none.

The implementation, firmware, keys, private storage and full raw runs remain excluded. The public artifacts can rebuild the publication and inspect its curated claims, not reproduce the private native port independently. Third-party interface content retains its original rights.

## Publication validation

The repository’s build, content/provenance tests and browser checks apply to the website. They do not repeat the device experiments. The source snapshot and this edition date remain fixed when the publication is released. Later research findings require a new reviewed record or edition.

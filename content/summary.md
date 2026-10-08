---
{
  "title": "An old operating system, on a different phone",
  "description": "A plain-language account of what the PinePhone preservation study achieves, how it is checked and what remains unfinished."
}
---

## What has been achieved?

The PinePhone now runs selected original iPhone OS software from two generations: 1.1.4 and 3.1.3. The newer 3.1.3 daily test reaches a usable home screen with touch, battery indication and the stock Camera and Photos apps. The owner takes a photograph, powers the phone completely off and opens the same photograph after turning it back on. Those actions have dated acceptance records. [E41](/ios/evidence/E41/) [E51](/ios/evidence/E51/)

This is preservation research on one phone. It does not make the PinePhone a fully compatible iPhone, and it does not provide ordinary cellular service, Wi-Fi, audio playback or every historical app.

## What does “native” mean?

The old kernel and application instructions execute directly on the PinePhone’s ARM processor. New hardware adapters connect the old software’s expectations to the PinePhone’s storage, screen, touch controller, camera and power hardware. Some obsolete processor operations need selective compatibility handling. [E03](/ios/evidence/E03/) [E06](/ios/evidence/E06/) [E41](/ios/evidence/E41/)

QEMU, an emulator, helps develop and test those contracts. Its results are labeled separately from the real phone. A convincing emulator screenshot cannot prove that a physical touchscreen or camera works.

## Why is a saved photograph a useful result?

A shutter press crosses many parts of the system: sensor capture, image buffers, the original Camera app, JPEG encoding, storage and the Photos viewer. Opening the image after power-on also checks a useful form of persistence. The accepted 3.1.3 route keeps Apple application instructions and signature checks unchanged. [E44](/ios/evidence/E44/) [E51](/ios/evidence/E51/)

One detail matters: the saved JPEG is 1600 × 1200, but the current sensor capture is 640 × 480. Enlarging that image supplies the format the old software expects; it does not capture extra detail. The first successful Camera test also lacked a simultaneous serial log. Both limits remain in the record.

<figure><img src="/ios/evidence/images/E44-313-camera-stock.png" alt="Unchanged stock Camera screenshot recovered from the physical PinePhone, showing an upright robot model and a saved thumbnail" width="320" height="480" loading="lazy"/><figcaption>A genuine 3.1.3 Camera screenshot recovered from the phone’s storage. Its original pixels are preserved. This is a device screenshot, not a photograph of the panel or a measurement of image quality. <a href="/ios/evidence/E44/">Inspect its provenance →</a></figcaption></figure>

## How do we know what works?

Each experiment declares what it tests. Automated captures record events and timings. Fresh storage readbacks check that protected data remain unchanged. Filesystem checks and decoded images test the permitted saved data. The owner’s hand tests establish visible behavior such as touch, preview and complete power-off. These methods answer different questions. [E47](/ios/evidence/E47/) [E48](/ios/evidence/E48/) [E51](/ios/evidence/E51/)

The paper reports failures too. A proposed USB delay still failed. A restart route stalled in firmware. A later USB diagnostic found the phone’s connection service becoming ready after the computer’s first connection attempt. That is progress in diagnosis; normal pairing still needs to pass. [E46](/ios/evidence/E46/) [E53](/ios/evidence/E53/) [E54](/ios/evidence/E54/)

## What is still unfinished?

USB enumeration and the initial stock handshake work in finite trials, but ordinary pairing and file retrieval remain pending. Raw accelerometer readings do not yet produce accepted automatic screen rotation. Ordinary restart needs further hand acceptance. GPU acceleration, networking, telephony, full suspend and broader app coverage also remain open. [E46](/ios/evidence/E46/) [E52](/ios/evidence/E52/) [E55](/ios/evidence/E55/)

The [capability explorer](/ios/status/) shows each feature’s evidence and limit. The [systems paper](/ios/paper/) explains the design and measurements. The [edition note](/ios/edition/) fixes this account to the reviewed October 7 snapshot.

## What is public?

This site publishes original explanations, diagrams, selected measurements and reviewed captures. It does not distribute Apple firmware, keys, the private port implementation or storage images. Source hashes identify the reviewed private reports; they do not make those reports independently reproducible. This is an independent study by Felipe Guilherme Sabino, with AI-assisted engineering and publication preparation, and no Apple or PINE64 affiliation.

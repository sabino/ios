---
{
  "slug": "audio",
  "title": "An audio service can unblock startup without making sound",
  "description": "Discovery, shared memory, timing and the physical sink are separate compatibility boundaries.",
  "section": "Interaction",
  "order": 19,
  "evidence": [
    "E22",
    "E19",
    "E41",
    "E51"
  ],
  "sources": [
    "S04"
  ],
  "related": [
    "iokit-discovery",
    "hid-dependencies",
    "time-and-interrupts"
  ],
  "updated": "2026-10-07"
}
---

> **Current edition.** The dated baseline below is retained. The [October 7 systems paper](/ios/paper/) and the update at the end of this chapter describe the newer 3.1.3 frontier.

## The media service expected an output device

The native media investigation observed an empty CoreAudio device list and a later null active-device access in the original media stack. A compatible IOAudio2 publication experiment changed that frontier: the original client enumerated one output, opened it and mapped its memory; mediaserverd reached its event loop. [E22](/ios/evidence/E22/)

That is a concrete startup result. It is not a playback result. The published backend was explicitly unbound, and stream start remained unsupported. No sound output was established.

The distinction prevents a common preservation error: satisfying discovery well enough for another service to start does not mean the advertised physical capability exists in full.

## The interface includes time

The inspected output profile uses 44.1 kHz stereo, 16-bit linear PCM. Its buffer is 65,536 bytes, or 16,384 four-byte frames. The client also uses shared completion state and timestamps to extrapolate sample position. Those observations make a clock part of the interface, not an optional optimization.

A device that exposes a buffer but never advances a meaningful completion position cannot satisfy every client expectation. Equally, advancing a counter as though samples were played would misreport an unbound sink's behavior.

The research keeps the semantic layers explicit: memory accepted by a transfer helper, samples accepted by a timed sink, and sound produced by an actual output device are different events.

## Backpressure protects the samples

An original ring-transfer component was tested separately. It handles wraparound and partial backend progress, clears only accepted frames and preserves pending samples when a sink cannot accept more. Its cumulative count measures backend acceptance, not DAC playback.

That definition is valuable because it can be tested with original synthetic fixtures. A captured RAM sink establishes ordering and byte handling without requiring Apple software or a physical codec. It leaves scheduling, shared status publication and hardware integration for later gates.

A future asynchronous backend would also need to own any memory it retains. A helper that clears accepted ring data cannot safely hand out pointers to that same storage for later consumption without an explicit ownership transfer.

## Startup dependencies can cross subsystem names

SpringBoard and media initialization are not independent just because one appears visual and the other audible. An application can wait on media registration before it draws its normal interface. Earlier HID work similarly showed a visual startup wait caused by a legacy sensor dependency. [E19](/ios/evidence/E19/)

A useful investigation therefore captures the waiting original client and its dependency, rather than assigning the failure to the subsystem visible on screen. A black display can be the final symptom of an audio-service startup failure even when the framebuffer path itself is correct.

## The remaining audio acceptance

The next meaningful playback claim would require original-client start/stop, coherent shared timestamps, a timed consumer, sample delivery, underrun behavior and reopen. A physical result would additionally need codec, routing and output evidence.

Until those gates pass, the accurate statement is that compatible publication cleared a measured media startup fault. That finding is useful on its own, and remains useful precisely because it does not claim sound that was never observed.


## Reviewed advance: 3.1.3 and the current frontier, 7 October 2026

The current 7E18 stock media service path supports accepted Camera use, but the PinePhone audio codec/DMA output path is still unaccepted. A published audio service or valid media-server object does not imply audible playback. The next-target study also cannot inherit output acceptance from its static dependency inspection. [E41](/ios/evidence/E41/) [E51](/ios/evidence/E51/)

---
{
  "slug": "orientation",
  "title": "What, exactly, are we preserving?",
  "description": "A precise identity for the software, the experiment, and the claims this atlas can support.",
  "section": "Foundations",
  "order": 1,
  "evidence": [
    "E01",
    "E27",
    "E28",
    "E29",
    "E32",
    "E35",
    "E36"
  ],
  "sources": [
    "S01",
    "S02",
    "S03"
  ],
  "related": [
    "three-machines",
    "source-archaeology",
    "preservation-method",
    "native-iphone",
    "camera-capture"
  ],
  "updated": "2026-10-01"
}
---

> **Dated record.** The baseline below describes the 29 September edition. The dated October update later in this chapter records subsequent accepted findings.

## A system is more than a version label

This atlas examines **iPhone OS 1.1.4, build 4A102**, through a preservation project that studies the original software in emulation and adapts its kernel to a different physical board. The name “iPhone OS” describes the historical software family. It does not mean that every experiment ran an iPhone product profile, or that the native target provides telephony.

The working reference is the first-generation iPod touch, N45AP. The native target is the original Allwinner A64 PinePhone. The iPhone M68AP remains a distinct comparison target. In the inspected 4A102 archives, the iPhone and iPod kernelcache members are byte-identical, while their primary root images, board trees and bootloaders differ. That is a useful experimental control: common kernel behavior can be compared without assuming common peripheral or userspace behavior. [E01](/ios/evidence/E01/)

The target kernel identifies itself as a 933-era XNU ARM build. The exact matching public ARM source was not found in the inspected Apple releases. This work therefore includes observations of the original binary, original compatibility components, and carefully bounded experiments. It is not a claim that the entire kernel has been recovered as source. [E27](/ios/evidence/E27/)

## Three kinds of preservation

**Artifact preservation** establishes which software was examined. Build metadata, complete hashes and immutable inputs guard against accidentally comparing different systems. A hash establishes byte identity. It does not establish authenticity, authorization, or correct execution.

**Behavioral preservation** asks whether the original components still behave coherently. Does a storage completion report the correct count? Does a short button tap produce both edges? Does the original client receive memory with the permissions it expects? These questions remain meaningful even when the physical board changes.

**Knowledge preservation** retains the chain of reasoning: the observation, the hypothesis, the control, the result and the limit. An abandoned explanation can be valuable. The discovery that a framebuffer probe was ineffective prevents someone else from treating its zero-filled output as proof of a renderer failure.

This publication focuses on the third kind while describing evidence for the second. It distributes original prose, diagrams, structured summaries and the website. The experimental software artifacts and native-port implementation are outside its contents.

## The 29 September frontier

At the 29 September snapshot, the physical phone has executed original userspace, presented the original client's setup graphic, accepted physical button events through the guest HID path, and returned to recovery through a clean reboot path. Controlled power and filesystem experiments also passed their stated checks. These achievements support further interaction work.

They do not establish a generally usable phone. Physical touch, a complete home-screen interaction, reliable application coverage, audio output, networking, telephony, comprehensive CPU compatibility and power-loss durability remain separate questions. The emulator reference already reaches interactive SpringBoard, but that result belongs to its own environment. [E28](/ios/evidence/E28/)

## How to read this atlas

Begin with the three-machine distinction, then follow either the boot path, the pixel path, or the evidence-method tour. Each article links to numbered evidence records. Those records are curated reports from the private research corpus; they expose the method, environment, conclusion, limits and hashes of the supporting documents. They do not pretend that a public reader can reproduce the full firmware experiment using this website alone.

Read “observed” as a statement about the recorded experiment. Read “inferred” as an explanation that still needs discriminating evidence. Read “open” as an intentionally preserved boundary. Those distinctions are part of the research result.

## Reviewed advance: 1 October 2026

Edition 1.2 extends the 29 September baseline with accepted physical interaction and Camera records. N45 unlock, taps, brightness and visible pinch are now documented; the separate M68AP profile reaches its home screen and responds in Settings and Photos. These are original userspace observations on the native PinePhone route. [E29](/ios/evidence/E29/) [E32](/ios/evidence/E32/)

The M68 Camera also displays an accepted live preview and saves genuine VGA JPEGs that reopen after a fresh boot with identical hashes. The measured preview baseline selects about 7.9 distinct images per second despite nearly 30 native deliveries per second. Those limits remain part of the result. Audio playback, Wi-Fi, modem integration, full suspend, broad app coverage and a generally usable phone are still unestablished. [E35](/ios/evidence/E35/) [E36](/ios/evidence/E36/)

New evidence records E29–E40 belong to the explicitly pinned October source revision. E01–E28 retain their earlier document identities and conclusions. Read the [second-profile chapter](/ios/articles/native-iphone/) for the revised frontier and the [capability explorer](/ios/status/) for a concise current-edition view.

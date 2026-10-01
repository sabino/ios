---
{
  "slug": "three-machines",
  "title": "Three machines, three kinds of evidence",
  "description": "The iPod reference, the PinePhone contract model, and the physical phone answer different questions.",
  "section": "Foundations",
  "order": 2,
  "evidence": [
    "E03",
    "E17",
    "E20",
    "E28",
    "E29",
    "E32",
    "E35",
    "E38"
  ],
  "sources": [
    "S01",
    "S14",
    "S15"
  ],
  "related": [
    "orientation",
    "emulator-fidelity",
    "boot-handoff",
    "native-iphone",
    "camera-preview"
  ],
  "updated": "2026-10-01"
}
---

> **Dated record.** The baseline below describes the 29 September edition. The dated October update later in this chapter records subsequent accepted findings.

## Keep the substrates separate

The project uses three execution environments. Their shared software makes comparisons productive; their different hardware contracts make careless comparisons misleading.

| Environment | What executes | What a successful experiment establishes |
| --- | --- | --- |
| Original iPod reference | Legacy Apple software on the N45AP/S5L8900 software model | Behavior under that Apple-device model |
| PinePhone QEMU contract | Adapted XNU and original userspace on selected modeled A64 interfaces | Behavior under an explicit, partial native-board contract |
| Physical PinePhone | Board firmware, native bootstrap, adapted XNU and original userspace | The measured behavior on the tested handset and bundle |

The original reference reaches interactive SpringBoard. The partial native model is a debugging instrument. The phone is the physical acceptance target. Moving a result between these rows requires a new experiment, not a stronger adjective. [E28](/ios/evidence/E28/)

## Native execution and emulation are different architectures

In the reference route, a software emulator supplies the old board interfaces expected by the guest. In the native route, original XNU executes in AArch32 on the A64's Cortex-A53, with adaptations for CPU and platform differences. Native providers connect selected original service interfaces to the new board.

Neither route makes every executing byte identical to an original retail boot. The reference enters at a declared boot stage and uses prepared storage. The native route replaces the board startup path and adapts kernel/platform behavior. Preservation documentation should name those differences explicitly.

The presence of higher exception levels in a firmware handoff does not, by itself, make the native route a virtual Apple machine. Conversely, running the same instruction set does not make the board compatible. Interrupt controllers, timers, memory attributes, storage and display all carry separate semantics.

## Why the partial model is useful

An emulator can make a narrow contract inspectable. A synthetic card can be deliberately corrupted. A display copy can be stopped before and after submission. A page-table walk can be compared against the memory backing. Negative controls can establish that a checker rejects a plausible but wrong result.

Those advantages do not make the model a full PinePhone. In particular, a device model that responds immediately cannot certify a physical settling delay. Guest RAM accesses do not reproduce every cache-coherency issue. A model can also accidentally supply memory at an address that real hardware does not back. See the emulator-fidelity chapter for examples.

## Compare one boundary at a time

The early unchanged-kernel entry experiment is a useful example. It established entry and arm_init on the A53 model, then recorded a CPU-specific fault. It was successful as an entry diagnostic while remaining unsuccessful as a boot. [E03](/ios/evidence/E03/)

The later display experiment had a different acceptance boundary: the original framebuffer client supplied a source image; the presentation service copied it into the active panel scanout; the physical operator saw the expected graphic. That closes a physical presentation question without closing touch or home-screen usability. [E17](/ios/evidence/E17/)

Button work subsequently closed another boundary: physical taps produced guest HID edges and visible wake/blank transitions. It did not inherit touch success from the reference emulator. [E20](/ios/evidence/E20/)

The general method is to preserve the environment as part of every claim's identity. A reliable notebook should let a reader answer “which machine?” before asking “did it work?”

## Reviewed advance: 1 October 2026

The physical route now has accepted N45 gestures and an independently prepared M68 home-screen profile. The latter adds an accepted stock Camera preview. These are new physical observations, not consequences inferred from QEMU success. [E29](/ios/evidence/E29/) [E32](/ios/evidence/E32/) [E35](/ios/evidence/E35/)

A fourth label is useful for the camera-performance work: an isolated ARM replay executes original queue bookkeeping with synthetic image identities and stubbed services. It is classified as a synthetic probe, not as a complete emulator boot or a physical camera. Its near-30 image-selection rate belongs only to the modeled scenarios. [E38](/ios/evidence/E38/)

The native route continues to execute adapted XNU directly on the A64. Linux recovery is a separate staging and inspection environment; it is not the host underneath the accepted native userspace. The wireframe groups the board, kernel, services and applications without inserting a Linux or hypervisor layer into this path.

---
{
  "slug": "emulator-fidelity",
  "title": "A model must fail honestly",
  "description": "Unexpected zeros, inherited memory and instantaneous devices can make an emulator too helpful.",
  "section": "Method",
  "order": 21,
  "evidence": [
    "E26",
    "E07",
    "E03",
    "E28",
    "E42",
    "E49",
    "E58",
    "E63"
  ],
  "sources": [
    "S01",
    "S14"
  ],
  "related": [
    "three-machines",
    "observability",
    "preservation-method"
  ],
  "updated": "2026-10-07"
}
---

> **Current edition.** The dated baseline below is retained. The [October 7 systems paper](/ios/paper/) and the update at the end of this chapter describe the newer 3.1.3 frontier.

## A false radio was the warning

A phone restore-stage diagnostic reported that a radio board was present while running on a model with no radio. The inspected predicate read an input whose model returned zero. That low value selected the “present” branch. The log was real; its implied hardware claim was false. [E26](/ios/evidence/E26/)

This is a particularly useful example because the failure mode looks like progress. A developer watching only console milestones could promote a default response into a modem achievement. The source-level and binary comparison instead identified an unsupported input accidentally satisfying a detection predicate.

## Unknown behavior should stay visible

An unimplemented register returning zero can be reasonable only when that value is part of an explicit contract. Otherwise it may clear an error, advertise a device or satisfy a polling condition. The same concern applies to writes accepted without effect and completion events emitted before their prerequisites exist.

A useful model identifies unsupported accesses and preserves a trace of them. A peripheral test should include a negative case showing that absence or failure is observable. The objective is not to make every guest check pass; it is to make the modeled subset internally meaningful.

This principle also applies to inherited board resources. A custom machine built on a generic platform may inherit memory or devices at addresses where the physical target has nothing equivalent. Successful access in the model then fails to test the native assumption.

## Match the contract used by the experiment

The timebase discrepancy is a concrete model-to-hardware lesson. The earlier model value and the physical counter differed. Once the phone measurement established 24 MHz, the current contract adopted matching counter/deadline conversion while retaining an explicit historical mode for old trees. [E07](/ios/evidence/E07/)

Matching those units improves one comparison. It does not make the machine a complete A64 implementation. Analog charging, cache visibility, DRAM initialization and electrical timing need separate evidence.

An emulator that completes storage commands quickly cannot certify the adequacy of physical timeout budgets. A host screenshot of RAM scanout cannot certify the panel's DSI timing. These are limitations of the chosen model boundary, not reasons to discard it.

## Use the reference as a control

The iPod reference and native contract answer different questions. If an original service behaves similarly in both, that can narrow a native failure. If it differs, the comparison is useful only when software identity, prepared data and observation windows are controlled. [E28](/ios/evidence/E28/)

The early native entry test deliberately stopped at a CPU-specific fault and reported no OS boot. That makes it a good model experiment: it established the reachable frontier without fabricating the missing behavior. [E03](/ios/evidence/E03/)

The preservation value of an emulator is its inspectable, reproducible contract. Every extension should state which observed behavior it models and which physical questions remain outside that contract.

## Read a presence predicate literally

The static GPIO example uses address `0x3e4000e4`, obtained from base `0x3e400004` plus seven register strides of `0x20`. Its tested mask is `0x2`. A minimal expression of the inspected predicate is:

```c
/* Explanation of the branch condition, not a driver implementation. */
bool bit_is_clear = (register_value & 0x2) == 0;
```

An unimplemented read that returns zero makes this expression true. That can select a device-present branch even though the model has no such device. The nonzero alternative in the [truth table](/ios/evidence/E26/#truth-table) is static reasoning, not a measured alternate run. QEMU describes its [virt board as a generic virtual platform](https://www.qemu.org/docs/master/system/arm/virt.html); board-specific behavior still needs explicit modeling.


## Reviewed advance: 3.1.3 and the current frontier, 7 October 2026

Physical HCR SWIO readback, eMMC mapping attributes and inherited camera regulator state show why QEMU is a gate rather than a hardware oracle. Each correction retains its discriminating control and limit. The later 10B500 diskless QEMU experiment reaches CPUIdle and two-input dispatch but no accepted normal banner, root or userspace; it must not be described as a physical iOS 6 port. [E42](/ios/evidence/E42/) [E49](/ios/evidence/E49/) [E58](/ios/evidence/E58/) [E63](/ios/evidence/E63/)

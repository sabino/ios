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
    "E28"
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
  "updated": "2026-09-29"
}
---

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

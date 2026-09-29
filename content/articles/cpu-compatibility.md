---
{
  "slug": "cpu-compatibility",
  "title": "ARM compatibility has several layers",
  "description": "Shared instruction names do not settle privileged state, atomics or exception behavior.",
  "section": "Machine",
  "order": 5,
  "evidence": [
    "E03",
    "E06"
  ],
  "sources": [
    "S06",
    "S07",
    "S08"
  ],
  "related": [
    "mmu-and-caches",
    "boot-handoff",
    "observability"
  ],
  "updated": "2026-09-29"
}
---

## Start with the code that actually executes

The target kernel is ARMv6-era software. The native board uses Cortex-A53 with AArch32 execution. Ordinary application instructions are only one part of that overlap. Kernel bootstrap, system-control operations, cache maintenance, exception entry and synchronization depend on architectural details beyond the label “ARM.”

The earliest bounded entry experiment reached an ARM1176-specific peripheral remap access and recorded an undefined-instruction exception on the A53 model. The same operation also appeared in a reset path. A one-site intervention that exposed the next boot frontier would therefore not establish a complete replacement for the original behavior. [E03](/ios/evidence/E03/)

The methodological point is to inventory exercised semantics. A successful compiler target or a small supervisor test cannot prove that every instruction and control state used by the original kernel is compatible.

## Undefined instructions are evidence, not instructions to ignore

The physical userspace experiments later recorded obsolete ARM SWP instructions in original code. Those instructions exchange memory and a register value. Advancing the program counter without performing the exchange would let execution continue with different program semantics.

The experimental compatibility component recognizes the instruction class and preserves the original exception fallback when it cannot handle a case. The observed resident-address exchanges allowed later startup progress. That is useful empirical evidence, but it leaves a substantial correctness boundary. [E06](/ios/evidence/E06/)

The recorded backend was not validated for complete atomicity, copy-on-write, read-only mappings, unmapped pages or multiprocessor execution. “The observed application advanced” and “the architecture is implemented correctly” are different propositions.

## Why the difficult cases matter

A memory exchange has several obligations at once: it must obey permissions, interact correctly with faults, avoid exposing a partial update, and return the prior value in the expected register. Copy-on-write adds another question: did the operation update the calling task's private page or a shared backing page? Concurrency asks whether another observer can interleave a conflicting update.

A test that uses one resident writable word on one active CPU exercises a useful path but leaves these obligations largely untouched. Preservation must keep that scope attached to the result. A general decoder does not automatically confer general memory semantics on its backend.

## Separate decoding, execution and integration

A clear validation plan distinguishes three layers. First, synthetic cases establish decoding, conditions and register outcomes. Second, architecture-level tests establish memory and exception behavior. Third, an original-client workload establishes that the compatibility component is integrated into the intended runtime path.

Failure in one layer should not be hidden by success in another. Conversely, a limitation should be stated precisely enough that future work can address it without discarding the useful measurements already made.

The Linux arm64 legacy-instruction documentation provides an independent example of explicitly classifying obsolete and deprecated instructions. It is a reference for the nature of the problem, not evidence that the native XNU implementation inherits Linux's correctness. The port's actual obligations remain tied to its own mappings, fault paths and tested workload.

---
{
  "slug": "cpu-compatibility",
  "title": "ARM compatibility has several layers",
  "description": "Shared instruction names do not settle privileged state, atomics or exception behavior.",
  "section": "Machine",
  "order": 5,
  "evidence": [
    "E03",
    "E06",
    "E39",
    "E41",
    "E42",
    "E46",
    "E58"
  ],
  "sources": [
    "S06",
    "S07",
    "S08"
  ],
  "related": [
    "mmu-and-caches",
    "boot-handoff",
    "observability",
    "measuring-performance"
  ],
  "updated": "2026-10-07"
}
---

> **Current edition.** The dated baseline below is retained. The [October 7 systems paper](/ios/paper/) and the update at the end of this chapter describe the newer 3.1.3 frontier.

> **Dated record.** The baseline below describes the 29 September edition. The dated October update later in this chapter records subsequent accepted findings.

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

## Read the captured exchange

The instruction word `0xe1002091` in the physical receipt decodes to the following single instruction. This is a semantic illustration of the captured opcode, not the compatibility backend:

```asm
swp r2, r1, [r0]  ; read old word into r2; exchange with r1
```

The successful receipt names PC `0x2fe25724`, address `0x2fe3c788`, width 4 and old value 0. The earlier observer dump supplies `r0=0x2fe3c788` and `r1=1`, but comes from a different run. Neither line is a post-exchange register dump. Therefore a calculated final register value must not be presented as a separately observed register value. Compare the [original lines and instruction-state table](/ios/evidence/E06/#observed-swap) before considering broader atomicity claims.

## Reviewed advance: an atomic hotspot, 1 October 2026

A later physical OFF/ON replay sharply reduced the measured legacy atomic-trap rate: mean reductions across four interaction windows were 98.50–99.91%. Mean frame gaps improved in two windows and worsened in two. This establishes removal of a major local source of trap overhead without establishing consistent UI acceleration. [E39](/ios/evidence/E39/)

The sample is one pair, with intentional pauses and some damaged UART gap rows. App-open latency, repeated order controls, forced contention and SMP acceptance remain unmeasured. The user-reported startup slowdown is unresolved. The earlier generic compatibility questions about faults, permissions and copy-on-write remain open; optimizing one measured hot path does not close them. The [performance chapter](/ios/articles/measuring-performance/) explains the units and limits.


## Reviewed advance: 3.1.3 and the current frontier, 7 October 2026

The 7E18 CPU policy accounts for physical HCR SWIO RES1 readback while retaining rejection of other unexpected bits. Relinking that correction exposed stale SWP helper branch destinations; linkage was rebuilt from the actual loaded objects. These are separate failures. Ordinary instructions execute natively, with selective compatibility handling. The later 10B500 QEMU frontier remains a real clock-gate dependency panic, without accepted normal banner, root or launchd. [E41](/ios/evidence/E41/) [E42](/ios/evidence/E42/) [E46](/ios/evidence/E46/) [E58](/ios/evidence/E58/)

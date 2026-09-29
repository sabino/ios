---
{
  "slug": "storage-abi",
  "title": "A correct sector with the wrong completion is still wrong",
  "description": "The legacy callback boundary exposes a concrete difference between toolchain conventions.",
  "section": "Storage",
  "order": 9,
  "evidence": [
    "E10",
    "E09",
    "E11"
  ],
  "sources": [
    "S05"
  ],
  "related": [
    "iokit-discovery",
    "async-storage",
    "hfs-integrity"
  ],
  "updated": "2026-09-29"
}
---

## The data path includes the callback

A block operation has at least two externally visible results: the bytes transferred and the completion reported to its caller. Checking only the sector contents misses errors in status, byte count, callback context or register preservation. The original 4A102 storage family supplied a particularly clear example. [E10](/ios/evidence/E10/)

The measured legacy completion convention carries a 64-bit completed-byte count across a register/stack boundary. The contemporary bare-metal EABI comparison places that argument differently. A conventional C declaration compiled for the new environment can therefore look correct while delivering the wrong words to the original receiver.

The finding is specific to the inspected boundary. It is not a complete reconstruction of the Darwin C++ ABI and should not be generalized to every framework or kernel callback.

## Static evidence needed an executable control

The project examined the exact-build call sites and compared compiler behavior, then used original synthetic ARM and Thumb receivers. The test deliberately used nonzero high and low count words. That choice matters: a zero high word can conceal an argument-placement mistake in short transfers.

The receivers checked argument values and the surrounding calling convention. A deliberate register-clobber case tested restoration. A null-action case tested the absence of a callback. Most importantly, an ordinary-EABI negative control produced the wrong count as expected. [E10](/ios/evidence/E10/)

A positive test says that one implementation agrees with its expected output. A discriminating negative control shows that the test would catch the actual class of mistake under investigation. It strengthens the claim substantially.

## Preserve the boundary, avoid overclaiming the type

Disassembler symbols and decompiler signatures are navigation aids. They can suggest a prototype, but the emitted call sequence determines how that binary uses registers and stack words. Nearby public source versions can corroborate intent while differing in overloads or structure layout.

The atlas records the semantic mismatch rather than distributing firmware-specific bindings. The scientific result is that the legacy interface needed an explicit convention bridge and that its assumptions were tested independently of the original filesystem.

## Integration remains a second gate

A synthetic receiver does not prove that the real provider locates the correct inherited method or supplies a valid memory descriptor. The later integration separately exercised original kernel clients, media discovery and real request completion. [E09](/ios/evidence/E09/)

Even then, completion timing mattered. Calling the correct action with correct arguments synchronously caused recursive provider entry in the early one-sector implementation. Moving the completion to a deferred context closed a different defect. [E11](/ios/evidence/E11/)

This is a useful preservation pattern: isolate the narrow ABI contract with original fixtures, then establish its integration through the original client. Keep those evidence layers distinct so that later lifetime or concurrency failures do not erase a valid boundary measurement—or get hidden behind it.

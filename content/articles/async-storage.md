---
{
  "slug": "async-storage",
  "title": "Completion order is part of the storage device",
  "description": "Reentrancy, backpressure and shutdown turned a sector adapter into a system contract.",
  "section": "Storage",
  "order": 10,
  "evidence": [
    "E11",
    "E13",
    "E14",
    "E41",
    "E45",
    "E51"
  ],
  "sources": [
    "S05"
  ],
  "related": [
    "storage-abi",
    "hfs-integrity",
    "time-and-interrupts"
  ],
  "updated": "2026-10-07"
}
---

> **Current edition.** The dated baseline below is retained. The [October 7 systems paper](/ios/paper/) and the update at the end of this chapter describe the newer 3.1.3 frontier.

## Why an inline callback exhausted the stack

The first integrated provider used one-sector transfers and completed successful requests synchronously. The original block driver could respond by submitting the next chunk immediately. Each operation retained the previous transfer's frames, so a sequence of correct reads grew the kernel stack until it faulted. [E11](/ios/evidence/E11/)

Increasing transfer size would only change how many recursive steps occurred. The successful control deferred completion through a preallocated kernel thread call. Callback arguments were captured before making the slot available to another request. The next request could then arrive without inheriting the entire prior transfer stack.

The unchanged one-sector diagnostic completed 39 reads after that correction. It was still a small read-only test, with a much narrower queue policy than the later userspace workload.

<figure class="research-figure">
<img src="/ios/figures/storage-completion.svg" alt="A request has a lifetime: Client submits a read. A provider owns a pending operation.. Provider completes the transfer. Bytes alone do not complete the contract.. Return through a deferred context. Arguments, lifetime and ordering must agree." width="440" height="568" loading="lazy" />
<figcaption>The completion belongs to the request contract. This sequence is conceptual; it is not a timing trace.</figcaption>
</figure>

## Admission pressure is not a media failure

Later writable experiments exposed queue-full failures. Two runs with catalog damage also recorded rejected request starts. The provider advertised a 512-byte maximum transfer even though its transfer layer could handle much larger requests, multiplying admissions. A recovery copy obtained before host mass-storage attachment already contained catalog corruption, excluding host automount as the cause of that particular instance.

The exact filesystem sequence linking a rejected request to the damaged catalog bytes was not fully proven. The evidence supports a concrete transport-pressure concern and a corrected control, not an unrestricted causal claim about every HFS failure. [E13](/ios/evidence/E13/)

The revised path advertised a larger transfer size and handled queue pressure in normal thread context. Reentrant submissions from the completion worker received a distinct overflow strategy. Those changes preserved the rule that an accepted operation receives exactly one completion while avoiding inline transfer recursion.

## A passing workload has an exposure limit

Two consecutive corrected 12-minute phone boots returned to recovery without manual reset. Full data copies passed read-only fsck, clean bits were set, and root hashes were unchanged. However, both runs recorded zero uses of the new overflow path. [E13](/ios/evidence/E13/)

That last sentence is essential. A branch may be compiled and covered by synthetic checks yet remain unexercised on the phone. The physical result supports the observed workload, not arbitrary queue saturation or all allocation-failure behavior.

## Shutdown must close the outstanding work

A clean reboot requires more than entering a reboot function. Accepted writes must drain, their results must be accounted for, and the underlying medium must finish the required operation before reset. A printed reboot marker once preceded a separate integration failure and no actual watchdog reset.

The stronger acceptance observes return to recovery and checks the resulting volume. A separate QEMU file experiment also follows a write through sync, guest reset and fresh-process readback. [E14](/ios/evidence/E14/)

Storage preservation therefore includes time and ownership: when a request is accepted, who retains its memory, when its completion becomes visible, and what a synchronization boundary guarantees. A sector checksum alone cannot answer those questions.


## Reviewed advance: 3.1.3 and the current frontier, 7 October 2026

The accepted 7E18 halt reaches stock sync/unmount and authoritative native drain before a bounded PMIC shutdown request. Camera restoration errors must block shutdown, not be hidden by a successful shutter event. The daily trial separately accepts staying off and reopening a new photograph after cold power-on; it does not establish sudden-power-loss durability. [E41](/ios/evidence/E41/) [E45](/ios/evidence/E45/) [E51](/ios/evidence/E51/)

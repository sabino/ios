---
{
  "slug": "observability",
  "title": "Measure the observer before trusting the observation",
  "description": "The project repeatedly found that the diagnostic path could mimic the failure under investigation.",
  "section": "Method",
  "order": 22,
  "evidence": [
    "E16",
    "E24",
    "E25",
    "E26",
    "E50",
    "E53",
    "E54",
    "E56",
    "E60"
  ],
  "sources": [
    "S14"
  ],
  "related": [
    "emulator-fidelity",
    "preservation-method",
    "display-blanking"
  ],
  "updated": "2026-10-07"
}
---

> **Current edition.** The dated baseline below is retained. The [October 7 systems paper](/ios/paper/) and the update at the end of this chapter describe the newer 3.1.3 frontier.

## A zero-filled buffer can mean no measurement happened

The framebuffer investigation initially found zeros in a diagnostic destination and treated them as evidence that the original source was blank. A known-pattern control exposed the weakness: the descriptor access route was not producing a validated transfer. The corrected mapped-descriptor path then revealed real original-client pixels. [E16](/ios/evidence/E16/)

The general rule is to include a control with a known nonzero result and verify the amount of data actually observed. Initializing a buffer to zero is good defensive programming, but that zero becomes ambiguous if failed or empty reads are not distinguished from successful reads of zero bytes.

## A missing message can mean a changed route

BOOT_TIME was another ambiguous signal. Two physical runs reached comparable HID and power-client milestones while only one printed that console message. Compared runtime-state files did not support the proposed stale-state explanation. A logging-route race remained plausible but untraced. [E24](/ios/evidence/E24/)

The correct conclusion is that the marker alone is insufficient. It is not that every absent marker is harmless. Some QEMU runs also lacked later milestones, so those runs retained separate uncertainty.

Positive markers have the same limitation. MACH Reboot showed that code reached a logging point; an earlier experiment still failed before the actual reset. Acceptance improved when it required observed return to recovery and post-run filesystem checks. [E25](/ios/evidence/E25/)

## A liveness probe proves its own route

A low-rate heartbeat can establish that its timer and callback continue running. It cannot prove application responsiveness. A debugger may display stale register state when its protocol and the current execution state disagree. A host capture process can exit while the phone keeps running.

Each observer needs a declared scope. Pair independent observations when they answer the same question from different directions: a source-memory signature and physical appearance, a guest event and client response, a transfer hash and complete-volume check.

Avoid making all “independent” checks depend on the same unverified helper. Two tools that read the same wrong address do not become corroborating evidence merely because their output formats differ.

## Record a failed hypothesis as a result

A useful experiment log has five fields: the claim being tested, the control, the observation, the updated interpretation and the remaining uncertainty. The false-radio experiment is a model example: the console reported presence; the model contained no radio; source and predicate inspection explained how the default input caused the message. [E26](/ios/evidence/E26/)

That record teaches more than deleting the misleading line from a status summary. It identifies a reusable class of error.

## Keep timing and identities attached

A screenshot without its selected surface and run identity loses much of its diagnostic value. A filesystem result without the input/output image identities cannot be assigned confidently to a trial. A comparison with different observation windows may merely sample different startup phases.

This atlas therefore treats environment, method, date, document digest and limitations as part of the evidence, not administrative decoration. The measurements remain private experiment reports, but the public summaries preserve enough structure to explain why a conclusion was drawn and where a stronger conclusion would need new work.


## Reviewed advance: 3.1.3 and the current frontier, 7 October 2026

Quiet hot-path USB logging advances address application, then a separate stale-DATAEND configuration fault appears. Host URBs do not expose every wire ACK, and complete selected mux frames do not establish whole-capture completeness. The later listener is first sampled 41.237 s after startup; this is not exact bind time or isolated RSA cost. Sensor cleanup inference has no direct success marker and no join/unload proof. [E50](/ios/evidence/E50/) [E53](/ios/evidence/E53/) [E54](/ios/evidence/E54/) [E56](/ios/evidence/E56/) [E60](/ios/evidence/E60/)

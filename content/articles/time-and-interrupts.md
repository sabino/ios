---
{
  "slug": "time-and-interrupts",
  "title": "Time must agree with interrupt delivery",
  "description": "Counter frequency, callback lifetime and scheduler progress cannot be validated independently.",
  "section": "Machine",
  "order": 7,
  "evidence": [
    "E07",
    "E08",
    "E24",
    "E48",
    "E50",
    "E55",
    "E62"
  ],
  "sources": [
    "S07",
    "S11"
  ],
  "related": [
    "device-tree",
    "async-storage",
    "power"
  ],
  "updated": "2026-10-07"
}
---

> **Current edition.** The dated baseline below is retained. The [October 7 systems paper](/ios/paper/) and the update at the end of this chapter describe the newer 3.1.3 frontier.

## A counter is a unit system

The physical PinePhone counter runs at 24 MHz in the recorded experiment. An earlier emulator-derived tree advertised 62.5 MHz. With that declaration, an unchanged nominal one-second delay was observed as roughly 3.015 seconds over UART. Correcting only the declaration produced roughly 1.010 seconds. The kernel, timer and storage identities remained fixed. [E07](/ios/evidence/E07/)

The result is important for more than boot speed. Time conversion feeds timeout budgets, scheduling and service startup. If the unit is wrong, an apparently conservative wait may last much longer than intended, and elapsed-time comparisons between environments lose their meaning.

The measured intervals are serial arrival times at the host. They include observation overhead and do not establish exact counter quality. The Allwinner counter erratum is a separate concern: a correct declared frequency does not establish that every individual read is reliable.

## A working callback can stop being the active callback

The native time path uses architectural timer facilities and the A64 interrupt controller. The original kernel still performs later CPU and interrupt registration. One direct-handoff experiment installed a native timer callback successfully, then a later original registration replaced it with a legacy handler that expected another interrupt identity.

The combined callback control preserved the relevant routes and returned from 51 observed timer interrupts while retaining earlier console and commpage evidence. That is a lifecycle result: initialization order and later registration matter as much as the initial function pointer. [E08](/ios/evidence/E08/)

A useful trace records both installation and use. “The initializer ran” does not show that the callback remained selected when the interrupt arrived.

## Idle is an interrupt test too

A spinning idle loop can conceal a missing wake condition. Code repeatedly revisits a condition even when no event properly wakes it. A real low-power wait removes that accidental polling. A regression after enabling a wait instruction therefore needs evidence about entry, exit, deadlines and pending work before it can be assigned to the instruction itself.

Guest-side idle and wait counters, cumulative residency and low-rate heartbeats are more informative than host CPU utilization alone. Host utilization also depends on emulation, logging, the host scheduler and which startup phase was measured.

This is a conceptual distinction, not a claim of complete suspend/resume. The recorded native work retains limited keep-awake policies and incomplete platform power behavior. An idle CPU, a dimmed screen and a suspended board are different states.

## Progress needs more than a single log line

Two physical runs reached corresponding late userspace milestones even though only one printed BOOT_TIME. The missing message was therefore insufficient to classify that run as a stall. A logging-route race is plausible but was not directly established. [E24](/ios/evidence/E24/)

The stronger progress record combines increasing timer/idle counters, service attachment, process state, storage health and a controlled response. Each measures a different part of the system. A heartbeat proves that its callback runs; it does not prove that SpringBoard is responsive. A framebuffer response proves more about that client, but still says little about disk durability.

Keeping those measurements separate makes the timer and interrupt layer a testable foundation for higher-level claims.


## Reviewed advance: 3.1.3 and the current frontier, 7 October 2026

Current physical display and raw-sensor diagnostics use the nominal 24 MHz counter with their own elapsed boundaries. The 6.7983 Hz sensor callback rate is not the sensor output data rate. A requested USB timer cadence is not guaranteed scheduling. UTC RTC initialization and the verified São Paulo time-zone file/resolver are separate; the owner-visible clock hand check remains pending. [E48](/ios/evidence/E48/) [E50](/ios/evidence/E50/) [E55](/ios/evidence/E55/) [E62](/ios/evidence/E62/)

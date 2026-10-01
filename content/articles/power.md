---
{
  "slug": "power",
  "title": "Measure energy flow, not just idle",
  "description": "CPU residency, USB input usability and backlight power are related but independent variables.",
  "section": "Method",
  "order": 20,
  "evidence": [
    "E23",
    "E07",
    "E17",
    "E20",
    "E30",
    "E31"
  ],
  "sources": [
    "S09",
    "S11",
    "S13"
  ],
  "related": [
    "time-and-interrupts",
    "display-blanking",
    "hfs-integrity",
    "measuring-performance"
  ],
  "updated": "2026-10-01"
}
---

> **Dated record.** The baseline below describes the 29 September edition. The dated October update later in this chapter records subsequent accepted findings.

## High idle residency did not settle the drain

The physical research measured substantial time in the CPU's wait state while battery drain remained a concern. That observation rules out a simplistic equation between “CPU idle” and “the device is charging.” Other rails, the panel, peripheral state and the USB input path can dominate the energy balance. [E23](/ios/evidence/E23/)

Likewise, a charging label observed later in recovery describes that environment at that moment. It does not prove that the same power path was usable while XNU was running. The relevant experiment needs measurements during the target state and a bounded before/after comparison.

## A controlled inactive state changed the result

The project compared the USB-C controller's native-run state with a known recovery environment, then tested a defined inactive ANX7688 state. The accepted 12-minute run reported usable USB input and increased battery from 29% to 31%. A matched known-good-data control also gained two percentage points. [E23](/ios/evidence/E23/)

This establishes the usefulness of that tested sink configuration. It does not establish full USB-C Power Delivery, every charger/cable combination, complete peripheral shutdown or a universal explanation for earlier resets.

The exact electrical mechanism was investigated through board documentation and control observations. A plausible backfeed hypothesis and a successful state change are not identical to a complete measured causal chain. The public guide preserves the result and its scope without providing hardware-write recipes.

## Time and observation windows matter

A fixed-duration power test is only meaningful when the platform's timebase is correct. The earlier nominal one-second delay lasted about three seconds until its clock declaration was corrected. [E07](/ios/evidence/E07/)

Battery percentages are also coarse, filtered readings. A two-point change over a short interval is useful when supported by PMIC status and a matched setup, but it is not a precision power measurement or a long-term runtime estimate. Voltage, current, temperature, screen policy and source capability would strengthen a broader study.

A lit-panel experiment and a headless experiment should not be combined into one battery-performance claim. The physical presentation work deliberately kept the backlight on; later input runs could still lose battery even though recovery reported charging. [E17](/ios/evidence/E17/) [E20](/ios/evidence/E20/)

## Recovery is part of the measurement

A spontaneous reset can end a power experiment before the target state is sampled. The recovery environment may then alter rails and resume charging. Recording only the final battery reading leaves a large causal gap.

The project improved this boundary with low-rate UART observations and a requested clean reboot. A controlled end point permits a complete filesystem copy and a known transition back to recovery. Those controls support interpretation, but do not guarantee recovery from every kernel failure.

## A bounded claim worth preserving

The accepted claim is modest and useful: the tested controller state restored usable USB input and net battery gain during the stated headless run. Complete power management, thermal behavior, battery runtime and suspend/resume remain independent research topics. Keeping them separate prevents a successful charging experiment from becoming an unsupported claim about the entire phone.

## Reviewed advance: native samples, 1 October 2026

The earlier recovery-bracketed observations now have a separate native measurement record. A read-only AXP803 adapter publishes a genuine original power-source object. Controlled QEMU samples show original SpringBoard consumption of charging, unplugged and full states; those values are synthetic and establish the consumer contract only. [E30](/ios/evidence/E30/)

On the physical phone, the initial bright lock-screen window drew a median 55 mA from the battery at the recorded 500 mA nominal input limit. Blanked idle instead supplied a median 166 mA to the battery. Brief wake windows had a positive median balance. These are net battery-side currents, not measurements of total USB input or whole-board watts. [E31](/ios/evidence/E31/)

The charging icon and USB attachment therefore cannot certify that a demanding workload is replenishing the battery. Native temperature was unavailable, and these trials changed neither PMIC configuration nor CPU clocks. Longer camera workloads, thermal supervision, suspend and higher-current charging policies need separate acceptance. The current record supports a workload-dependent budget, not a battery-life estimate.

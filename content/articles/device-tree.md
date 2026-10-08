---
{
  "slug": "device-tree",
  "title": "The device tree is a live contract",
  "description": "Archived bytes describe less than the tree that iBoot actually gives XNU.",
  "section": "Machine",
  "order": 4,
  "evidence": [
    "E01",
    "E02",
    "E07",
    "E09",
    "E19",
    "E41",
    "E43",
    "E57"
  ],
  "sources": [
    "S11",
    "S15"
  ],
  "related": [
    "boot-handoff",
    "iokit-discovery",
    "time-and-interrupts"
  ],
  "updated": "2026-10-07"
}
---

> **Current edition.** The dated baseline below is retained. The [October 7 systems paper](/ios/paper/) and the update at the end of this chapter describe the newer 3.1.3 frontier.

## The archive was missing runtime values

The archived N45AP tree contained zero CPU clock properties. The captured tree at the working iBoot-to-XNU handoff contained a 6 MHz timebase, 24 MHz fixed clock, 412 MHz CPU clock and 103 MHz bus clock. The node count remained 73. Repeated captures differed in their overall hashes while agreeing on these clocks. [E02](/ios/evidence/E02/)

The implication is stronger than “fill in the zeros.” The archive is an input to a bootloader transformation. The final tree can contain runtime information, and a kernel experiment that skips the bootloader must account for that transformation explicitly.

The inspected M68AP archive also had zero clocks, but no equivalent M68AP live handoff was established in that experiment. Copying the N45 values into an M68 or PinePhone declaration would create an assumption, not a measurement.

## Two tree formats, two consumers

The native diagnostic uses an Apple-format tree for XNU and a separate flattened board tree for the platform/model. Similar terminology does not imply identical formats or ownership. One describes interfaces to original Apple platform code; the other describes the native board environment.

The Apple-format reader also encountered duplicate property names. Converting such a structure into an ordinary dictionary can silently destroy information. A faithful inventory retains order and duplication, and a request for a unique value should fail when the input is ambiguous.

## A property can cause a driver to run

A device-tree declaration is not passive documentation. It participates in matching, service publication, function lookup and dependency discovery. An advertised legacy sensor registered far enough to draw HID startup into a transaction on unsupported hardware. Omitting that unavailable sensor changed the service graph and allowed readiness signaling to complete. [E19](/ios/evidence/E19/)

The reverse effect is equally important. Removing old flash devices also removed the normal demand for a prelinked storage family. A replacement block provider could exist without its expected driver ever matching until the family was initialized. [E09](/ios/evidence/E09/)

These results suggest two checks for a tree edit: what hardware behavior does the declaration promise, and what software dependency did that declaration previously trigger? Deleting an unsupported node can be correct while still requiring a deliberate replacement for an incidental dependency.

## Clock properties change behavior

A stale timebase declaration later made a nominal one-second physical delay last about three seconds. A matched tree-only correction brought the observed delay close to one second. That is a direct example of descriptive metadata entering scheduler and timeout calculations. [E07](/ios/evidence/E07/)

A preservation record should therefore identify the exact tree used by each experiment alongside its kernel and module identities. “Same firmware version” is insufficient when two trees advertise different devices or different units of time.

## Limits of a live tree

Even a live tree is not an electrical measurement. It may omit a board subrevision, use a shared compatible string, or reflect firmware policy rather than fitted hardware. The tree supplies an important contract and a valuable hypothesis source. Register observations, board documentation and controlled physical tests establish which parts of that contract hold on the actual device.


## Reviewed advance: 3.1.3 and the current frontier, 7 October 2026

7E18 service publication needs the correct parent/provider contract as well as a named display child. Its shared adapter selects separate exact-build layouts rather than importing the 4A102 tree wholesale. The newer-target study reads actual trees and kernel contracts but does not turn static provider presence into runtime acceptance. Missing modem integration also does not mean the PinePhone lacks its physical EG25-G. [E41](/ios/evidence/E41/) [E43](/ios/evidence/E43/) [E57](/ios/evidence/E57/)

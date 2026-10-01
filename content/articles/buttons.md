---
{
  "slug": "buttons",
  "title": "A physical key becomes a guest event",
  "description": "The successful wake path connects two different hardware sources to the original HID contract.",
  "section": "Interaction",
  "order": 17,
  "evidence": [
    "E20",
    "E18",
    "E29",
    "E33"
  ],
  "sources": [
    "S12",
    "S13"
  ],
  "related": [
    "display-blanking",
    "touch",
    "power",
    "native-iphone"
  ],
  "updated": "2026-10-01"
}
---

> **Dated record.** The baseline below describes the 29 September edition. The dated October update later in this chapter records subsequent accepted findings.

## Power and volume come from different devices

The PinePhone power key is observed through the AXP803 PMIC's power-key events. The volume keys use the A64 analog key input. Treating all three as ordinary GPIO inputs would miss the actual board paths. The native work uses a polled kernel callback to translate their validated events into the original N45 HID service. [E20](/ios/evidence/E20/)

This retains the original client-facing event machinery. It does not emulate the old Samsung GPIO controller merely because the original button class once used that controller internally.

## Preserve identity and edges

The inspected N45 profile expects a hold/sleep-wake button and a menu/Home button. The accepted binding maps the physical Power key to the former. Each volume key is temporarily mapped to Home/menu. A successful volume-key test therefore establishes Home event delivery, not audio-volume adjustment.

A short input must contain both a press and a release. If both hardware edges arrive between polls, the consumer still needs the pair. If two physical sources alias the same logical key, releasing one must not necessarily release a key still held by the other. Lost releases can leave the original user interface behaving as though a key is permanently held.

The publication records the semantic route without distributing firmware bindings. The result is the preserved relation between a physical edge and the original client's event interpretation.

## The evidence has a visible endpoint

The model gate began with black scanout. A short Power event through the same polling route produced the original setup image; a second produced black again. The physical Power trial then recorded three short taps and three corresponding press-release pairs. The operator saw setup image, black, setup image, and the first wake had nonzero panel-frame evidence. [E20](/ios/evidence/E20/)

A separate physical boot tested the two volume keys individually. Each produced a Home/menu press followed by a release. Both runs ended through the UART clean-reboot path. Complete recovery copies of the data volume passed read-only fsck with clean bits, and the root hash remained unchanged.

These checks couple the new input behavior to already established storage and recovery postconditions. They do not prove every subsystem is stable, but they help detect regressions caused by the new integration.

## What remains outside this result

The experiment did not validate a held Power key, whose PMIC behavior may independently turn the board off. It did not validate sustained volume-key auto-repeat, touchscreen events or a complete home-screen interaction. The panel response is the original setup display's wake/blank behavior, not deep suspend/resume. [E18](/ios/evidence/E18/)

A later publication should add separate evidence for each expanded interaction. It should preserve the original meaning of this first result: a physical key, a correctly formed guest event, and a visible response through the original operating system's own input and display policy.

## Reviewed advance: screenshot and brightness controls, 1 October 2026

Later physical trials accepted the visible minimum of the Settings brightness slider while retaining complete Power blank/wake. A separate M68 run recorded one complete screenshot chord and saved a stock lock-screen TIFF. [E29](/ios/evidence/E29/) [E33](/ios/evidence/E33/)

The temporary mappings remain profile-specific controls: Power serves sleep/wake, Volume Up serves Home, and Volume Down requests a screenshot. They do not establish audio-volume adjustment. The screenshot’s reported pause remains unmeasured, and its later reboot was host-requested rather than evidence that pressing the shortcut caused a crash.

---
{
  "slug": "native-iphone",
  "title": "A second userspace profile, a separate acceptance boundary",
  "description": "The M68AP home screen, native screenshots and the limits of calling a port a phone.",
  "section": "Foundations",
  "order": 25,
  "evidence": [
    "E01",
    "E29",
    "E32",
    "E33",
    "E36"
  ],
  "sources": [
    "S03",
    "S09"
  ],
  "related": [
    "orientation",
    "three-machines",
    "touch",
    "camera-capture",
    "camera-stills"
  ],
  "updated": "2026-10-01"
}
---
## The profile changes the questions

The physical PinePhone now runs a separate M68AP iPhone OS 1.1.4 research profile as well as the N45AP iPod touch route. This matters because a shared kernel does not make the two userspaces interchangeable. The archive comparison found identical 4A102 kernelcache members alongside different board descriptions and root images. Product capabilities, application choices and service expectations remain profile-specific. [E01](/ios/evidence/E01/)

In the reviewed M68AP physical run, the owner unlocked to the home screen and used Settings and Photos by touch. The candidate then returned through clean reboot. A full data copy passed a read-only filesystem check; the M68 root, N45 root and data, and partition-table controls remained unchanged. This is an accepted interaction result for a prepared local preservation profile. It does not describe retail activation, cellular registration or an installation that can be redistributed. [E32](/ios/evidence/E32/)

## Acceptance is a sequence

The first home-screen run did not save a screenshot. An attempted shortcut and a responsive Photos app were insufficient evidence that a screen capture existed. A later trial saved one original 320 × 480 TIFF of the charging lock screen. Its extracted PNG is pixel-identical, and that later record retains the reported temporary pause as an unresolved timing question. The guest date visible in the screenshot is not the experiment date. [E33](/ios/evidence/E33/)

Camera acceptance progressed independently. The later still-saving record contains two sensor-derived JPEGs, accepted gallery display after a fresh boot and unchanged file hashes. These findings add concrete behavior to the profile; they do not retroactively turn the earlier Photos tap into a camera test. The distinction makes the progression inspectable and prevents a capability table from inheriting evidence that never measured its claim. [E36](/ios/evidence/E36/)

N45 also has its own accepted interaction result: stable finger identities let the owner enlarge an offline Photos fixture with a pinch. Its camera-less product profile exposes a different album path. A screenshot being extractable from storage therefore need not mean that the same file appears in N45 Photos. [E29](/ios/evidence/E29/)

## A modem exists; integration remains open

The original PinePhone includes a Quectel EG25-G modem, as the [board documentation](/ios/sources/#S09) records. The native port has not established a working modem-to-telephony service path. “No Service” is a software state on the screen, not evidence that the board lacks cellular hardware. The status page now classifies telephony as planned integration.

Audio playback, Wi-Fi, full suspend, broad app coverage and power-loss durability also remain open at this edition. A responsive home screen is a substantial milestone, but each of those behaviors needs its own device contract and acceptance record. Preserving two profiles is useful precisely because their successes and failures can be compared without collapsing them into a single claim that everything works.

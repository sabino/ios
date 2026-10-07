---
{
  "slug": "touch",
  "title": "Coordinates are only the beginning of touch",
  "description": "Acquisition, contact lifetime, queue delivery and viewport geometry must agree.",
  "section": "Interaction",
  "order": 18,
  "evidence": [
    "E21",
    "E17",
    "E20",
    "E29",
    "E43",
    "E51"
  ],
  "sources": [
    "S17",
    "S11"
  ],
  "related": [
    "buttons",
    "presentation",
    "iokit-discovery",
    "native-iphone",
    "measuring-performance"
  ],
  "updated": "2026-10-07"
}
---

> **Current edition.** The dated baseline below is retained. The [October 7 systems paper](/ios/paper/) and the update at the end of this chapter describe the newer 3.1.3 frontier.

> **Dated record.** The baseline below describes the 29 September edition. The dated October update later in this chapter records subsequent accepted findings.

## The obvious convenience method did nothing

Static inspection found that this build's absolute-pointer convenience method was an empty stub. Sending coordinates to a plausible-sounding API would therefore discard the event. The original touch route instead involves a user-client queue, a MultitouchSupport parser and a plugin that converts packets into digitizer events. [E21](/ios/evidence/E21/)

This is a recurring lesson in legacy research: modern API expectations and method names do not establish an older binary's behavior. A live original-client test must follow the actual delivery path.

## A packet parser is not a touchscreen driver

The project has original building blocks for reading and validating Goodix-style reports and for encoding a bounded legacy contact payload. Constructed down/end vectors and host checks provide useful component evidence. They do not establish physical bus transfers or delivery to an original application.

A complete path needs board power/reset configuration, an I2C transport, a consumed-report acknowledgment policy, contact-ID tracking, event ordering, original queue publication, notification and user-client interpretation. A failure in any one of these can look like “touch does not work.”

The physical binding must also establish the fitted controller identity. A board tree and a shared driver support list are references, not substitutes for a valid device response.

## Contacts have lifetimes

An application does not receive an unrelated coordinate on every sample. It observes a contact beginning, moving and ending. IDs must remain consistent across reports; a zero-contact frame is an event with meaning. Lost releases can leave a gesture active indefinitely. Duplicate or out-of-range IDs require explicit handling.

A useful synthetic sequence includes a press, movement across several samples, release, and a second contact reusing an ID only after the first lifetime ended. Queue-full and missed-report cases also need a defined policy. Those are proposed acceptance dimensions, not claims that the current physical port passes them.

## Use the display's geometry

The accepted panel route centers a 2× 320 × 480 guest image inside a 720 × 1440 panel. Its active rectangle has 40-pixel horizontal and 240-pixel vertical margins. [E17](/ios/evidence/E17/)

A touch transform must agree with that exact viewport. Points inside the displayed image map to guest coordinates; points outside need an explicit policy instead of being silently clamped onto an edge. Sensor orientation, calibration and contact size remain additional inputs.

A correct formula on synthetic points is still only a transform test. It should be followed by a visible target in the original application and a controlled physical tap that causes the expected response.

## The current frontier

Physical buttons already reach original HID and wake the setup display. That result provides a working example of event delivery but does not validate the different touch queue and parser. [E20](/ios/evidence/E20/)

At this publication snapshot, physical touch and complete home-screen interaction remain open. The proposed first touch gate is intentionally narrow: one down/end sequence through the original client, a visible response, no stuck contact, and the existing clean-reboot and filesystem checks afterward.

## Reviewed advance: from contacts to gestures, 1 October 2026

The earlier touch gap is now closed for specific physical interactions. Goodix contacts traverse the original touch user-client and HID path with monotonic timing. A long physical run submitted 1,476 frames, including 470 with two active contact identities, but the owner could not establish visible pinch. That run proves contact delivery, not the gesture. [E29](/ios/evidence/E29/)

A later trial exposed the missing distinction: two contact records shared the same interpreted finger identity. The consumer treated them as a collision. Stable distinct identities allowed the owner to enlarge the offline Photos grid by spreading two fingers. Trial 18 submitted 439 frames, 123 with two active contacts, and also accepted the visible brightness minimum and Power blank/wake. Its complete post-run data copy passed fsck with an unchanged root. [E29](/ios/evidence/E29/)

The screenshot in the new record comes from that physical native run. It supports the captured screen state; the gesture claim rests on owner acceptance and the recorded contact path. General gesture, keyboard and application coverage remain open. The headless PinePhone QEMU tree disables touch, and a separate touch-enabled variant aborts early; neither is substitute acceptance for the phone.


## Reviewed advance: 3.1.3 and the current frontier, 7 October 2026

The October 3 7E18 physical input/display run uses synthetic contacts through the genuine Z2 consumer; it is not human-finger acceptance. The October 7 daily trial separately accepts real slide-to-unlock and touch. The historical two-contact identity correction remains scoped to its own 4A102 gesture test. The alignment-safe trailing checksum rationale is retained in [C62](/ios/claims/#C62). [E43](/ios/evidence/E43/) [E51](/ios/evidence/E51/)

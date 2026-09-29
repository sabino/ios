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
    "E20"
  ],
  "sources": [
    "S17",
    "S11"
  ],
  "related": [
    "buttons",
    "presentation",
    "iokit-discovery"
  ],
  "updated": "2026-09-29"
}
---

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

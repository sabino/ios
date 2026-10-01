---
{
  "slug": "camera-stills",
  "title": "A saved photograph is more than a shutter event",
  "description": "Follow a genuine VGA frame through encoding, gallery display and a fresh-boot identity check.",
  "section": "Storage",
  "order": 29,
  "evidence": [
    "E33",
    "E35",
    "E36"
  ],
  "sources": [
    "S09",
    "S19"
  ],
  "related": [
    "camera-capture",
    "camera-preview",
    "hfs-integrity",
    "native-iphone",
    "frame-retirement"
  ],
  "updated": "2026-10-01"
}
---
## Capture and saving failed at different points

A shutter event can reach the native camera and still fail to produce a photograph. In the reviewed development sequence, an early still request completed at the capture boundary but left the shutter closed and saved no JPEG. A later attempt reached software encoding but the application exited. Those failures are retained in the source record because they explain why native completion alone was an inadequate acceptance test. [E36](/ios/evidence/E36/)

The accepted path uses genuine 640 × 480 sensor pixels and the original application’s software JPEG path. It does not enlarge the VGA capture to claim a higher resolution. Surface metadata must describe the actual accessible image when the encoder reads it, and the surface must remain owned while the consumer needs it. This is the same general memory-lifetime question that appears in preview rendering, though the consumers and completion events differ.

## The successful trial closes several gates

The accepted physical trial completed two still requests, saved two JPEGs and their thumbnails, and resumed preview. The first photograph initially appeared black in the phone’s viewer even though its saved JPEG decoded normally on the host. The second appeared correctly. That transient failure remains unexplained; the existence of valid bytes should not erase the visible problem. [E36](/ios/evidence/E36/)

A fresh boot supplied the missing follow-up. No new still request occurred. The two original JPEGs retained identical hashes and the owner confirmed that both reopened in the stock gallery. This separates persistence from a cached display: the accepted result belongs to a new boot and the same saved files.

| Acceptance step | Evidence in the reviewed pair |
| --- | --- |
| Sensor-derived image | Two genuine VGA JPEGs; no upscaling |
| Save path | JPEGs and corresponding thumbnails recovered |
| Continued interaction | Preview resumed after capture |
| Fresh boot | No new still requests; both files reopened |
| Byte identity | Both original JPEG hashes unchanged |
| Filesystem control | Two full 512 MiB data copies; clean bits; fsck exit 0 |
| Scope control | Nine protected regions unchanged in each run |

These checks establish the exercised clean-reboot path. They do not establish sudden-power-loss safety, arbitrary gallery operations or long-term storage reliability. Two pictures are a deliberately bounded result. [E36](/ios/evidence/E36/)

## Read the public image accurately

The evidence record includes the unchanged second JPEG, showing a small robot model. Its encoded dimensions are 640 × 480. The original orientation tag makes it display upright as 480 × 640. The metadata’s Apple and iPhone names come from the software profile; the physical sensor is the PinePhone’s OV5640. The guest timestamp is not a trustworthy wall-clock date.

A screen capture is a different artifact. The earlier M68 TIFF records the application-visible screen, not a camera exposure. Keeping the two records separate prevents a screenshot of a camera interface from standing in for a saved sensor photograph. [E33](/ios/evidence/E33/)

Higher-resolution stills, capture latency, broader exposure behavior and the initial black-viewer transient remain open. Those questions can now be investigated against a working, checked VGA save path.

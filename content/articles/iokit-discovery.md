---
{
  "slug": "iokit-discovery",
  "title": "A driver is a relationship, not just an object",
  "description": "Class registration, service matching and platform dependencies govern whether useful work can begin.",
  "section": "Storage",
  "order": 8,
  "evidence": [
    "E09",
    "E12",
    "E19",
    "E22"
  ],
  "sources": [
    "S05",
    "S04"
  ],
  "related": [
    "storage-abi",
    "hid-dependencies",
    "audio"
  ],
  "updated": "2026-09-29"
}
---

## Publication is only one step

The native storage research encountered a provider that existed but did not attract the expected generic driver. The eventual explanation was not a missing sector operation. Removing legacy flash nodes had also removed the normal demand for the prelinked IOStorageFamily. Its class registration and matching machinery had not been initialized at the time of the replacement provider's publication. [E09](/ios/evidence/E09/)

Once the original family was available, the concrete native provider could participate in the expected match and publish media. This preserves an important property of the approach: the original storage family, partition layer and filesystem remain responsible for their own work, while the native boundary supplies board operations.

## Class identity and lifetime have meaning

An object's method table is not the whole object model. Metaclass identity, construction, inheritance, registry attachment, initialization and destruction all constrain whether a provider is valid. A copied table that happens to answer one call would not establish a correctly integrated driver.

The experiment registered a named concrete class through the original machinery and checked its superclass. This is stronger evidence than merely returning success from a guessed entry point. It still does not establish production-quality teardown, repeated startup or concurrent lifetime behavior.

The right acceptance boundary is an original client performing a real operation through the service. For storage, that meant descriptor transfer, completion and media discovery. For display, it later meant original-client surface submission. For audio, enumeration and mapping had to be distinguished from playback.

## Missing hardware can create a software wait

A tree node may promise a platform function that never becomes available on the new board. In one graphics investigation, startup waited on an old panel-enable provider. Other services waited on a legacy power-function dependency. More rendering commands could not resolve a service lookup that had not returned.

Likewise, an advertised legacy light sensor registered without first proving a working transaction, then blocked the HID readiness path. Declaring that sensor absent allowed the original initialization to continue. This was a faithful absence statement, not a successful sensor implementation. [E19](/ios/evidence/E19/)

These examples make the registry and dependency graph central research objects. The graph explains why an apparently unrelated peripheral can prevent a higher-level service from reaching its event loop.

## Success at one layer does not imply the next

The original HFS mount returned successfully before the root vnode was installed and before launchd started. A later platform handshake was still pending. The filesystem and the startup barrier were separate states. [E12](/ios/evidence/E12/)

An audio publication experiment similarly let the original client enumerate and map an output and allowed mediaserverd to advance. It did not produce sound. [E22](/ios/evidence/E22/)

The practical lesson is to name the observed edge in the service graph: constructed, registered, matched, opened, mapped, submitted, completed or visibly consumed. “The driver works” hides those boundaries and makes later evidence difficult to compare.

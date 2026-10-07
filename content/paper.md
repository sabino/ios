---
{
  "title": "Rehosting early iPhone OS on open mobile hardware",
  "subtitle": "Native execution, hardware contracts and bounded acceptance",
  "description": "A systems study of native iPhone OS 1.1.4 and 3.1.3 execution on the PinePhone, with measured results, negative experiments and explicit acceptance limits.",
  "author": "Felipe Sabino",
  "date": "2026-10-07",
  "version": "2.0"
}
---

## Abstract

Preserving a historical mobile operating system requires more than retaining its installation archive: observable behavior depends on obsolete processors, peripheral contracts and service ordering. This study investigates whether early iPhone OS can execute on an open, non-Apple mobile board while retaining original userspace consumers. We adapt the 1.1.4/4A102 and 3.1.3/7E18 kernels to the PinePhone’s Allwinner A64 using shared original hardware adapters, kernel-hash-selected bindings and selective architectural compatibility handling. QEMU supplies bounded development gates; physical capture, protected-media readback and owner hand tests establish acceptance. The 7E18 daily trial accepts touch, battery indication, upright stock Camera preview, photo saving, complete power-off and reopening a photograph after cold power-on. Camera output is 1600 × 1200, resampled from 640 × 480 acquisition. A 64-presentation idle interval averages 12.7 ms of elapsed display work; a separate finite diagnostic reads 100 real accelerometer samples at 6.80 observed callbacks/s. Native USB enumeration and the stock mux handshake advance to a listener-readiness frontier, with ordinary pairing still pending. Case studies expose differences between modeled and physical CPU state, memory attributes, logging latency and inherited regulator ownership. The result is a bounded native preservation system and an auditable experimental method, rather than complete device compatibility or an independently reproducible public port. [E41](/ios/evidence/E41/) [E44](/ios/evidence/E44/) [E50](/ios/evidence/E50/) [E51](/ios/evidence/E51/) [E52](/ios/evidence/E52/) [E54](/ios/evidence/E54/) [E55](/ios/evidence/E55/)

## 1. Introduction

Historical mobile software is unusually dependent on the device around it. A retained application may expect an old graphics service; that service may expect a particular kernel user client; the kernel may expect a processor instruction or power controller that no current board supplies. An archive preserves bytes. It does not, by itself, preserve the interaction among those layers.

This work asks a narrower, testable question: **can original early iPhone OS userspace operate through an adapted original kernel on an open mobile board, with hardware behavior accepted at named boundaries?** The native target is the original A64 PinePhone. The software targets are iPhone OS 1.1.4/4A102, with separate iPod touch and iPhone profiles, and iPhone OS 3.1.3/7E18 for the original iPhone. Their distinctions survive throughout the experiment. A shared historical kernel does not imply identical userspaces, peripheral expectations or acceptance. [E01](/ios/evidence/E01/) [E32](/ios/evidence/E32/) [E41](/ios/evidence/E41/)

“Native” describes the ordinary instruction-execution path: AArch32 kernel and application instructions execute on the A64’s Cortex-A53. The system still uses original replacement hardware providers and a resident compatibility/reset layer, including selective handling of legacy operations. It does not recreate the complete Apple board, and native execution does not imply an absence of traps or virtualization mechanisms. The partial PinePhone QEMU model is a separate development substrate. [E03](/ios/evidence/E03/) [E06](/ios/evidence/E06/) [E46](/ios/evidence/E46/)

The strongest current result is a physical 3.1.3 workflow. In the October 7 daily test, the owner unlocks the device, uses touch, sees battery and charging indication, blanks and wakes the display with Power, captures a photograph through the stock Camera app, opens it in Photos, powers the phone completely off and reopens the same photograph after cold power-on. This is useful preservation behavior, but it is not full phone functionality. Ordinary restart, networking, telephony, audio output, GPU acceleration, suspend and stock rotation retain separate open gates. [E51](/ios/evidence/E51/)

The study makes four contributions:

1. **A shared adaptation method across two historical builds.** Hardware algorithms remain shared while exact kernel identities select independently reviewed object layouts, method bindings and entry contracts.
2. **A bounded physical system with stock consumers.** Display, input, storage, power and Camera reach real device behavior without changing the accepted 3.1.3 Apple userland instructions or relaxing signature checks.
3. **An experimental acceptance method.** Frozen staging, finite trials, recovery, immutable-region hashing, fresh filesystem checks and owner hand tests separate progress from acceptance.
4. **Discriminating failures and measured boundaries.** The paper retains model/hardware disagreements, rejected approaches and instrument limitations alongside timing, camera and USB results. [E41](/ios/evidence/E41/) [E44](/ios/evidence/E44/) [E47](/ios/evidence/E47/) [E50](/ios/evidence/E50/) [E53](/ios/evidence/E53/)

This is a versioned research publication derived from private experiments. The evidence pages publish selected fields, reviewed captures and original explanations. They identify the unavailable source reports by basename, digest and locator. That supports an authorized audit; it does not provide independent public reproduction. The [claims ledger](/ios/claims/) exposes the claim-to-source mapping, and the [edition note](/ios/edition/) fixes the October 7 boundary.

## 2. Background

### 2.1 The boards and software builds

The original iPhone and first-generation iPod touch targets belong to the S5L8900/ARM11 generation. The PinePhone instead supplies an Allwinner A64 with Cortex-A53 cores, a GIC, eMMC, a 720 × 1440 panel, a Goodix touch controller, an AXP803 power-management device, an OV5640 rear sensor and MUSB USB hardware. The public board description establishes available hardware; it does not establish that the native XNU port drives each peripheral. In particular, the PinePhone has an EG25-G modem even though native telephony integration is unaccepted. [1](#ref-1) [2](#ref-2) [E32](/ios/evidence/E32/)

The inspected 4A102 kernel identifies XNU 933.0.0.211, while 7E18 identifies XNU 1357.5.30. Both selected historical kernels are ARM32, but their boot arguments, reserved initialization space, service layouts and userspace contracts differ. Public XNU source explains architectural organization; a nearby release is not proof of either proprietary ARM binary’s layout. The source inspection and exact-build binding gates carry that burden. [3](#ref-3) [E27](/ios/evidence/E27/) [E41](/ios/evidence/E41/)

| Software target | Original product context | Kernel identity / adaptation boundary |
| --- | --- | --- |
| 1.1.4 / 4A102 | N45AP iPod touch and M68AP iPhone; separate roots | XNU 933.0.0.211; retained older binding and memory-layout contract |
| 3.1.3 / 7E18 | M68AP / iPhone1,1 | XNU 1357.5.30; independently measured bindings, IOSurface and newer service expectations |

*Table 1. The two accepted software generations are not interchangeable ABIs. The kernel identities come from reviewed target inspection; original-root differences and shared 4A102 kernel identity are separate observations. [E01](/ios/evidence/E01/) [E41](/ios/evidence/E41/)*

### 2.2 XNU and IOKit contracts

XNU combines Mach, BSD and IOKit. Mach supplies tasks, threads and messaging; BSD supplies process and filesystem behavior; IOKit organizes C++ services, provider matching and device clients. Applications rarely need to know which physical controller ultimately performs a request. They do need the expected service to publish, accept a correctly shaped method, preserve ownership and complete honestly. Apple’s architecture description provides this context. [3](#ref-3) [4](#ref-4)

A replacement provider is therefore more than a plausible register driver. Storage has completion status and byte-count obligations; graphics has surface mapping and retirement; Camera has descriptors, dimensions, color ranges and asynchronous completion; HID has stable contact identities. Service registration proves discovery at one boundary. It cannot prove successful application use. [E09](/ios/evidence/E09/) [E10](/ios/evidence/E10/) [E15](/ios/evidence/E15/) [E29](/ios/evidence/E29/) [E44](/ios/evidence/E44/)

### 2.3 Boot time and runtime are different layers

The firmware handoff supplies initial CPU, memory and peripheral state. In the current SD-free route, Tow-Boot resides in the eMMC hardware boot area. A pre-XNU NuttX initializer and selector prepare the panel and choose a profile; the selected AArch32 XNU then owns the running OS. NuttX is boot-time preparation, not a Linux host underneath iPhone OS. The resident EL2 compatibility/reset path has a different lifetime from that initializer. Jumpdrive is the separate Linux recovery environment entered after a reset. [E43](/ios/evidence/E43/) [E46](/ios/evidence/E46/) [E48](/ios/evidence/E48/) [E61](/ios/evidence/E61/)

The inherited state is not an empty board. Regulators, clock gates, muxes and DMA-related fields may already belong to another boot stage. A native provider must verify its prerequisites, acquire only what it owns and preserve unrelated fields. The Tow-Boot/SD U-Boot comparison later in this paper shows why one assumed reset baseline was insufficient. [E49](/ios/evidence/E49/)

## 3. Related work

**Whole-system emulation and virtualization.** QEMU-iOS models early iPod touch hardware and provides an essential reference for historical behavior. Aleph Security’s iOS-on-QEMU work targets later iOS, documents QEMU/KVM execution and exposes an intentionally altered debugging/security configuration. Their board models and research acceptance are not the physical PinePhone contracts established here. [5](#ref-5) [6](#ref-6)

Corellium uses ARM-native virtualization through its CHARM hypervisor. It should not be described as instruction-by-instruction CPU emulation. Its virtual mobile-device platform shares the concern of supplying device contracts, but the present study addresses a specific physical open phone, historical AArch32 builds and owner-visible peripheral acceptance. No performance or capability comparison with Corellium was run. [7](#ref-7)

**Preservation at other boundaries.** touchHLE preserves early iOS applications through high-level emulation rather than booting the historical kernel and original service stack. Legacy iOS Kit supports restoration and related work on original Apple devices. It is relevant to preservation practice, but its firmware-patching route was not used for the accepted local-activation path here. Project Sandcastle takes the reverse direction, bringing Android/Linux to iPhone hardware. These approaches preserve different units: application behavior, original devices, or an alternative OS on an existing board. [8](#ref-8) [9](#ref-9) [10](#ref-10)

**Open mobile hardware.** PINE64 documentation, the mainline PinePhone device tree and the postmarketOS ecosystem provide hardware and Linux-port context. Those sources help identify components and ownership expectations; Linux support does not automatically transfer into IOKit. The postmarketOS device page was inaccessible to the review fetch after a redirect and anti-bot response, so this paper makes no current support claim from that page. Readable PINE64 documentation and the pinned mainline description support the board facts. [1](#ref-1) [2](#ref-2) [11](#ref-11)

**Translation and rehosting literature.** Bellard describes QEMU’s portable dynamic translation and full-system emulation. Avatar combines emulation with real embedded hardware for analysis, while P2IM abstracts peripheral interfaces to make firmware testing progress without the original hardware. These works show why CPU execution and peripheral behavior must be considered separately. Our engineering distinction is physical acceptance: a modeled return value can advance a test while failing to establish a real display, radio or power transition. [12](#ref-12) [13](#ref-13) [14](#ref-14)

The resulting position is specific, without a priority claim: **native execution of selected historical iPhone OS builds on a physical non-Apple mobile board, using original hardware providers and explicitly bounded evidence**. Neither the literature review nor the private experiments establish that this is the first such execution in all historical settings.

## 4. System design

<figure id="figure-2"><img src="/ios/figures/native-architecture.svg" alt="Boot and runtime architecture: A64 hardware, firmware, pre-XNU NuttX selector, resident EL2 compatibility, AArch32 XNU, original providers and stock userland; a separate reset route enters Jumpdrive." width="960" height="660" loading="lazy"/><figcaption><strong>Figure 2. Boot and runtime architecture.</strong> Original schematic for the 7E18 PinePhone route. NuttX performs boot-time panel/selector work; ordinary kernel and application instructions execute as AArch32 on the A53. Original providers supply hardware contracts beneath stock consumers. Resident EL2 compatibility/reset and separate Jumpdrive recovery are distinct branches. This is explanatory organization, not a captured call graph. <a href="/ios/evidence/E41/">E41</a>, <a href="/ios/evidence/E46/">E46</a>, <a href="/ios/evidence/E48/">E48</a>.</figcaption></figure>

### 4.1 Exact identity before adaptation

An input kernel digest selects a reviewed binding contract. Unknown content or a conflicting build name is rejected. Bindings include object fields, method slots, callback instruction state and callable targets. Guards check the expected original context before an intervention is admitted. This reduces a dangerous failure mode: treating two similar releases as one ABI and interpreting a valid pointer through the wrong layout. [E41](/ios/evidence/E41/)

The shared implementation retains A64 hardware algorithms across 4A102 and 7E18. Separate binding data expresses the differences. Storage completion, queue backpressure and explicit-key AES behavior need not be forked merely because an inherited method table changes. Conversely, sharing source is not evidence that every binding is correct. Each build must pass its own admission and client gates.

### 4.2 Adapt a contract, preserve its failures

Guarded hooks replace hardware-facing behavior where the original platform cannot perform it. They are not a policy of making every unsupported operation return success. Unknown instructions retain their original exception fallback; unsupported camera/USB operations remain unsupported; signing failures remain failures. Progress is useful only if the new result represents the requested operation. [E06](/ios/evidence/E06/) [E44](/ios/evidence/E44/) [E52](/ios/evidence/E52/)

The display supplies software-rendered stock surfaces rather than pretending to provide the original GPU. The camera supplies sensor-derived buffers and a kernel JPEG endpoint rather than modifying signed Apple userland to force a save. Local activation uses an already present stock branch, narrowly scoped to its measured caller; unrelated identity queries retain their stock purpose. Those choices preserve the distinction between an original client working through a new provider and a client whose checks have been disabled. [E43](/ios/evidence/E43/) [E44](/ios/evidence/E44/)

### 4.3 Reserve memory and storage ownership explicitly

Native providers require memory outside the ordinary allocator, alongside translation tables, graphics pools and scanout. The 7E18 reservation plan gives growing providers separate slots and moves the allocation frontier only after checking the complete layout. A retained rejected trial exposed an old cold-entry guard that still expected the earlier table frontier. Reservation metadata and loaded code therefore form one contract. [E41](/ios/evidence/E41/)

Disk ownership is independently bounded. Separate OS windows prevent one profile from silently writing another. The boot partition’s growth preserves the OS payloads and uses reserved GPT entries to prevent those windows from being mistaken for free space. A boot-time memory address is not a disk interval, and neither reservation can substitute for the other. [E47](/ios/evidence/E47/)

## 5. Implementation

### 5.1 CPU, translation and legacy synchronization

The A53 executes the historical ARM instruction stream, but privileged startup cannot assume ARM1176-specific registers or cache geometry. The adaptation handles exercised incompatibilities through reviewed cold-entry, MMU and cache policy, while rejecting unexpected state. Translation must account for descriptor interpretation as well as backing memory: an earlier A53 access-flag control rejected a legacy descriptor despite valid physical backing. A matched change in interpretation advanced the commpage read. [E03](/ios/evidence/E03/) [E04](/ios/evidence/E04/) [E05](/ios/evidence/E05/) [E42](/ios/evidence/E42/)

Legacy SWP instructions require exchange semantics, not merely a skipped opcode. The physical startup path records handled exchanges and subsequent progress. A separate 4A102 hotspot change greatly reduces observed traps, but its measured UI frame gaps do not improve consistently. Complete atomicity, fault handling, copy-on-write and multiprocessor semantics remain wider obligations than the accepted workload. [E06](/ios/evidence/E06/) [E39](/ios/evidence/E39/)

### 5.2 Timer and interrupt delivery

Original kernel scheduling needs a real timebase and interrupts through the expected callback path. Native A64 timer/GIC work replaces the original controller interface; counter units remain explicit. A timer count proves that callbacks execute, not that userspace remains healthy. Diagnostic watchdog petting is finite and independent of normal profiles. The sensor and display measurements use the nominal 24 MHz counter, with their measurement boundary attached. [E07](/ios/evidence/E07/) [E08](/ios/evidence/E08/) [E40](/ios/evidence/E40/) [E50](/ios/evidence/E50/) [E55](/ios/evidence/E55/)

### 5.3 Storage, AES and service order

The original storage family receives real queue and completion behavior from the A64 MMC provider. Request bounds, byte counts, register preservation, asynchronous ownership, backpressure and final drain matter as much as sector bytes. Historical completion failures demonstrate why a visible block device is insufficient. Read-only root policy, RAM-only diagnostic data and permitted persistent private-data writes are separately declared. [E10](/ios/evidence/E10/) [E11](/ios/evidence/E11/) [E13](/ios/evidence/E13/) [E14](/ios/evidence/E14/)

For 7E18, the shared software AES provider supplies explicit-key operations and rejects nonzero UID/GID selections. It does not recreate hardware-bound device keys or a modern keybag. Stock file-integrity startup remains in the service order; bringing required providers up correctly resolves the dependency without changing the integrity policy. Later daily persistence is established by actual fresh media readback and hand use, rather than inherited from an earlier QEMU mount. [E41](/ios/evidence/E41/) [E51](/ios/evidence/E51/)

### 5.4 Display and stock software composition

The display provider must publish under the expected service parent, expose the correct surface contract and retire submissions. In the initial 7E18 route, a display completion counter coexisted with repeated SpringBoard crashes in the hardware compositor. The selected stock software-renderer path removes that unavailable GPU dependency through ordinary launch configuration; it does not change Apple executable instructions. Captured QEMU guest pixels then show the English lock/home transition. Physical scanout and later human use are separate gates. [E43](/ios/evidence/E43/)

The original 320 × 480 interface is doubled to 640 × 960 and centered within the 720 × 1440 panel. This is a bounded copy/expansion route, not a full-panel rescale or GPU driver. Surface backing, task permissions, source aliases and device visibility remain separate questions. The idle timing experiment measures this route without changing its cache or clock policy. [E15](/ios/evidence/E15/) [E17](/ios/evidence/E17/) [E50](/ios/evidence/E50/)

### 5.5 Input, local activation and locale

Goodix contacts reach the original Z2 multitouch consumer through the native input adapter. Home/Power events traverse the original HID path. Packet delivery and visible gestures require separate checks: the October 3 7E18 physical replay used synthetic contacts; the October 7 daily hand test establishes human touch. The earlier 4A102 work also shows that two contact records with one interpreted identity cannot prove pinch. [E29](/ios/evidence/E29/) [E43](/ios/evidence/E43/) [E51](/ios/evidence/E51/)

The local activation path uses a stock lockdownd branch whose hardware query receives the synthetic research response only at the measured activation caller. No Apple/carrier service is contacted, and signing/FairPlay policy is unchanged. Broadly scoping an identity response to the entire daemon would affect other queries with different meanings. English preferences belong to the private data configuration. São Paulo time-zone installation and libc/CoreFoundation resolution pass their checks, but the owner-visible clock check is still pending. [E43](/ios/evidence/E43/) [E54](/ios/evidence/E54/) [E62](/ios/evidence/E62/)

### 5.6 Power, halt and restart

Battery values originate in the physical PMIC and publish through the expected power-source service. A charging icon is an accepted UI observation, not a battery-endurance result. Older measurements show why input budget and workload matter: blanking and a bright lock screen produce different battery balances under the recorded USB limit. Power blank/wake also does not establish system suspend. [E31](/ios/evidence/E31/) [E51](/ios/evidence/E51/)

Clean halt follows stock shutdown through cleanup, sync/unmount and final native storage drain before bounded PMIC power-off. Earlier camera restoration failures are retained and must block shutdown rather than be suppressed. Continuous capture records the corrected Power-slider route; the daily test confirms that the phone stays off before cold power-on. [E45](/ios/evidence/E45/) [E51](/ios/evidence/E51/)

Restart exposes another boundary. The TF-A HVC/PSCI route stalls, including the diagnostic version-query path. The accepted single confirmation instead enters qualified EL2 after drain and resets with WDOG0, reaching a new SPL and the ordinary selector. This proves that route once. It does not close repeated ordinary stock-restart hand acceptance. Normal boot/runtime watchdogs remain off; a final post-drain reset fallback is a distinct safety mechanism. [E46](/ios/evidence/E46/)

### 5.7 Camera and JPEG

The accepted 7E18 path is stock PhotoLibrary → Celestial/FigRecorder → H1ISP/IOSurface consumers, supplied by original kernel camera and JPEG providers. Real OV5640/CSI acquisition produces 640 × 480 UYVY. The provider delivers the expected preview and still formats, uses bounded destination ownership and keeps the exclusive CSI ring separate. The kernel encoder serves the stock AppleJPEGDriver user client. Apple userland instructions and signature checks remain unchanged in this clean route. [E44](/ios/evidence/E44/)

The 1600 × 1200 still is resampled from that VGA acquisition. It satisfies the stock format contract but adds no captured scene detail. Owner acceptance covers preview, shutter, thumbnail, Photos and persistence. The first successful hand test lacks contemporaneous UART, and its pre-reboot JPEG digest was not extracted. We therefore report reopening and decoded post-reboot media, not byte-identical before/after persistence for that test. The later daily trial supplies continuous UART and cold-power-cycle acceptance. [E44](/ios/evidence/E44/) [E51](/ios/evidence/E51/)

<figure id="figure-3" class="paper-captures"><div><img src="/ios/evidence/images/E43-313-lock-qemu.png" alt="Genuine 7E18 English lock screen in the partial PinePhone QEMU model" width="320" height="480" loading="lazy"/><img src="/ios/evidence/images/E43-313-home-qemu.png" alt="Genuine 7E18 QEMU home screen with its original instruction overlay" width="320" height="480" loading="lazy"/><img src="/ios/evidence/images/E44-313-camera-stock.png" alt="Stock Camera screenshot recovered from the physical PinePhone, with upright sensor preview and thumbnail" width="320" height="480" loading="lazy"/></div><figcaption><strong>Figure 3. Genuine captures from distinct experiments.</strong> Left and middle: 7E18 guest pixels before and after synthetic unlock/Home replay in QEMU; the stock home-screen overlay is preserved. Right: an unmodified stock Camera screenshot recovered from physical private-data storage. All selected files retain original bytes and pixels, with source basenames and SHA-256 in <a href="/ios/evidence/E43/">E43</a> and <a href="/ios/evidence/E44/">E44</a>. None is a photograph of the panel, and the cellular labels establish no radio connection.</figcaption></figure>

### 5.8 Selector, eMMC and recovery

The physical panel selector defaults after twelve seconds and accepts Volume/Power navigation in its separately reviewed back-buffer trial. Bounded damage copies replace unnecessary direct redraws. Later title/background styling remains a separate candidate; the accepted controls cannot certify that candidate’s visual behavior. The publication has no reviewed selector panel photograph and uses the architecture schematic rather than manufacturing one. [E43](/ios/evidence/E43/) [E61](/ios/evidence/E61/)

AHVBOOT growth and reserved GPT entries prepare boot space without moving or overwriting OS windows. The SD-free route uses the existing eMMC bootloader, the selector and Jumpdrive; the installation does not rewrite that bootloader. RTC recovery state is consumed before profile entry, and explicit trial profiles retain finite watchdog paths. The deliberate early-stall test never reaches XNU, so its fast return cannot be attributed to guest shutdown. [E47](/ios/evidence/E47/) [E48](/ios/evidence/E48/)

### 5.9 USB and finite sensors

The original MUSB provider operates beneath stock IOUSBDeviceFamily. Admission covers the actual full-speed PTP+Mux configuration, endpoint/FIFO ownership, pending request completion and real controller state. EP0 address and configuration failures precede later enumeration and bulk work; their traces remain useful rather than being replaced by the final milestone. The passed stock mux handshake advances to local BSD connect and listener timing, with ordinary pairing and services pending. [E52](/ios/evidence/E52/) [E53](/ios/evidence/E53/) [E54](/ios/evidence/E54/) [E60](/ios/evidence/E60/)

A separate MPU6050 diagnostic admits its live memory mapping before touching the bus, reads a finite sequence and restores owned MPU/TWI state. It is not installed as a stock motion provider. A sibling shutdown test establishes one cleanup route through frozen-code inference and its observed success continuation; it does not prove callback join or unloading. Raw measurements must not be promoted to automatic screen rotation. [E55](/ios/evidence/E55/) [E56](/ios/evidence/E56/)

## 6. Methodology and safety

### 6.1 The trial is the unit of acceptance

Each trial declares its build, loaded profile, substrate, writable scope, capture method and recovery path. Staging verifies the frozen inputs before boot. QEMU checks exercised control flow, bounded fixtures and regression gates before a physical run, but does not certify physical cache attributes, regulator state, USB timing or power transitions. [E13](/ios/evidence/E13/) [E26](/ios/evidence/E26/) [E49](/ios/evidence/E49/)

The physical loop is stage → boot → capture → recovery → readback. Exclusive UART ownership avoids concurrent readers or accidental commands. Host-side USB observations, device RAM traces and counter timestamps retain distinct clocks and completeness limits. Watchdog/RTC recovery is finite for diagnostic profiles; it is not silently enabled in accepted daily profiles. Owner hand tests run only after the necessary technical gate and provide a different form of evidence from automated capture. [E40](/ios/evidence/E40/) [E48](/ios/evidence/E48/) [E51](/ios/evidence/E51/) [E54](/ios/evidence/E54/)

<figure id="figure-4"><img src="/ios/figures/trial-loop.svg" alt="Trial loop from freeze and preflight to bounded capture, recovery, fresh readback and owner acceptance, with failed gates returning to diagnosis" width="960" height="410" loading="lazy"/><figcaption><strong>Figure 4. Bounded experimental loop.</strong> Original schematic of the physical 7E18 method. Diagnostic watchdog leases and RTC return are configured per trial; accepted normal profiles keep boot/runtime watchdogs disabled. Protected bytes, permitted private-data deltas and owner-visible behavior are separate acceptance gates. A failed gate remains in the record and returns to diagnosis. <a href="/ios/evidence/E48/">E48</a>, <a href="/ios/evidence/E51/">E51</a>, <a href="/ios/evidence/E54/">E54</a>.</figcaption></figure>

### 6.2 Integrity checks after recovery

The host re-reads available protected intervals and staged files after execution, then compares immutable content with its baseline. Permitted private-data changes are assessed separately with fresh root/data copies, filesystem checks and decoded media. A “passed” run summary cannot replace these postconditions. Absent SD media are reported as absent, not counted as re-read. Recovery Linux’s clean filesystem state is not automatically the guest’s clean shutdown state. [E47](/ios/evidence/E47/) [E48](/ios/evidence/E48/) [E51](/ios/evidence/E51/)

Earlier camera recovery required a narrowly bounded private-data repair after a failed shutdown. That history is preserved beside the later clean halt. It prevents a misleading claim that every successful photograph was followed by an initially clean data volume. Likewise, finite USB cancellation can retain references until reset rather than prove complete teardown. [E44](/ios/evidence/E44/) [E45](/ios/evidence/E45/) [E52](/ios/evidence/E52/)

### 6.3 Two axes of evidence

| Substrate | Method | What the method can establish | What it cannot inherit |
| --- | --- | --- | --- |
| Original iPod model | Reference capture/replay | Modeled original-client behavior | Physical Apple or PinePhone behavior |
| Partial PinePhone QEMU | Guest trace, fixture, snapshot | Executed adapter/client gate in that model | Real MMIO attributes, electrical state or panel use |
| Physical PinePhone | UART, counter, host protocol capture, readback | Named runtime events and post-run bytes | Human usability or unobserved wire-level ACKs |
| Physical PinePhone | Owner hand test | The reported visible interaction in that profile | Every app, performance, durability or missing trace |
| Files/binaries | Static inspection | Exact inspected layouts or control flow | Runtime completion or responsive UI |
| Synthetic probe | Purpose-built fixture | The isolated contract under supplied assumptions | Complete client lifetime or real hardware |

*Table 2. Evidence classification has both a substrate and an observation method. “In progress” is an acceptance state, not a sixth substrate. Mixed records identify which part belongs to which environment. [Claims ledger](/ios/claims/), [research method](/ios/method/).*

## 7. Evaluation

The evaluation addresses four questions: does the shared design reach original consumers across builds; which physical interactions are accepted; what do the measurements actually count; and what remains after the latest USB gate? The corpus is one evolving project on one physical phone, not a benchmark population. The following tables select named experiments without constructing an aggregate success rate from overlapping reports.

### 7.1 Boot and visible acceptance

The October 3 default-selector trial provides buffered host-receipt milestones. The difference between the menu-start and choice markers is 12.049 seconds, consistent with the intended twelve-second selection. The later display and launchd markers are stages in that run, not universal cold-boot latencies. The run’s synthetic touch replay is superseded only for human use by the separate daily hand test. [E43](/ios/evidence/E43/) [E51](/ios/evidence/E51/)

| Milestone | Host receipt, s | Interpretation |
| --- | ---: | --- |
| Selector menu starts | 6.587 | Pre-XNU selector marker |
| Default 3.1.3 choice | 18.636 | 12.049 s after menu marker |
| Display route | 23.687 | Native pipeline marker; no panel photograph in this run |
| launchd | 44.974 | Stock userspace milestone |
| Jumpdrive recovery | 204.703 | Diagnostic return, not ordinary interactive reboot latency |

*Table 3. One physical 7E18 selector trial, measured from its host capture origin. UART buffering and work before each printed marker limit timing interpretation. Source: `pinephone-iphone313-stage4-selector-2026-10-03.json`, `/selector_physical_run/markers_seconds`. [E43](/ios/evidence/E43/)*

The October 7 daily test is stronger for end-to-end use: accepted touch and Camera behavior coincide with continuous UART and fresh available-region recovery. Power-slider shutdown stays off for thirty seconds, then cold power-on reopens the new photograph. Ordinary restart is explicitly outside that acceptance. [E51](/ios/evidence/E51/)

### 7.2 Camera throughput and output detail

The historical 1.1.4 comparison changes queue capacity from two to six. Different native-delivery, renderer-selection and panel-update rates reveal the bottleneck: panel updates can repeatedly reuse one selected image. The comparison improves distinct selection while native delivery falls modestly. It is one physical pair with unequal intervals, not a controlled multi-run speed claim and not a 3.1.3 measurement. [E59](/ios/evidence/E59/)

| 1.1.4 preview queue | Native deliveries/s | Distinct selected images/s | Panel update counter/s |
| --- | ---: | ---: | ---: |
| Two slots, before first still | 29.621 | 7.893 | 30.210 |
| Six slots, early steady preview | 26.279 | 16.520 | 30.544 |

*Table 4. Physical legacy Camera comparison from `/controlled_phone_comparison/phone13` and `/phone14`. “Selected” is the original renderer boundary; these counters do not individually prove physical panel presentation. Unequal sampling windows and one pair limit generalization. [E59](/ios/evidence/E59/)*

<figure id="figure-5"><img src="/ios/figures/camera-rates.svg" alt="Bars comparing two-slot and six-slot 1.1.4 Camera rates: native deliveries 29.621 versus 26.279, distinct selections 7.893 versus 16.520, and panel update counters 30.210 versus 30.544 per second" width="960" height="470" loading="lazy"/><figcaption><strong>Figure 5. More updates do not imply more distinct camera images.</strong> Original plot of one physical 4A102 queue comparison. Each rate counts the boundary named beside its bars. The native-delivery, selected-image and update samples are not interchangeable; the pair has unequal intervals. These values are not measured 7E18 preview throughput. <a href="/ios/evidence/E59/">E59</a>.</figcaption></figure>

| 3.1.3 Camera boundary | Recorded format | Accepted scope |
| --- | --- | --- |
| Actual sensor acquisition | 640 × 480 UYVY, full range | Real sensor-derived source |
| Stock preview destination | 400 × 304 YUYV, video range | Upright preview accepted by owner |
| Stock still destination/output | 1600 × 1200; resampled source, JPEG output | Save, thumbnail and Photos accepted; no extra captured detail |
| After power cycle | Same new photo opens in Photos | Daily cold-power-cycle acceptance; broader durability unproven |

*Table 5. 7E18 output geometry is a stock-client contract, not evidence of 1600 × 1200 acquisition. The first successful Camera hand test has a UART gap and no pre-reboot JPEG digest. The daily test is a separate later result. [E44](/ios/evidence/E44/) [E51](/ios/evidence/E51/)*

### 7.3 Display elapsed-time baseline

The later 64-presentation interval contains zero sampled source changes. Its mean total cost is 12.6937 ms, dominated by source work and expansion. The presentation gap is 12.8638 ms. These are elapsed counter observations around an idle route, which can include interruption and scheduling effects. They do not yield an animation frame rate or pure compositor CPU utilization. [E50](/ios/evidence/E50/)

| Instrumented boundary | Samples | Mean elapsed ms |
| --- | ---: | ---: |
| Source work | 64 | 4.7924 |
| 2× expansion | 64 | 7.8142 |
| Synchronization | 64 | 0.0004 |
| Completion | 64 | 0.0382 |
| Total work | 64 | 12.6937 |
| Presentation gap | 64 | 12.8638 |
| Diagnostic log | 1 | 72.3972 |

*Table 6. Physical 7E18, presentations 64-exclusive through 128-inclusive, nominal 24 MHz counter, zero sampled changes. Component means are instrumented boundaries and are not asserted to partition every tick exactly. Cache policy and CPU clock are unchanged. The single logging sample is not a 64-frame average. [E50](/ios/evidence/E50/)*

<figure id="figure-6"><img src="/ios/figures/display-timing.svg" alt="Mean idle display elapsed costs: source 4.7924 ms, expansion 7.8142 ms, total 12.6937 ms; one separate diagnostic log sample is 72.3972 ms" width="960" height="450" loading="lazy"/><figcaption><strong>Figure 6. Idle presentation cost and instrumentation cost.</strong> Original plot of the later 64-presentation physical 7E18 interval. The upper bars share a millisecond scale; the log is explicitly a separate single sample. Zero sampled changes make this an idle baseline. It is not an animation benchmark or a cache-policy comparison. <a href="/ios/evidence/E50/">E50</a>.</figcaption></figure>

### 7.4 USB protocol ladder

USB success is a sequence of gates. Real bus reset and descriptor transfer precede address application; full configuration precedes bulk mux traffic; mux framing precedes a local listener connection; ordinary pairing precedes service access. A later trial stays enumerated, records three stock mux reads and three writes without mux I/O errors, and passes the host v2 handshake. Finite cleanup still returns BUSY and retains prerequisites until reset. [E52](/ios/evidence/E52/)

| Gate | Reported state at this edition | Remaining qualification |
| --- | --- | --- |
| EP0 descriptor/address | Passed in later quiet/protocol trials | Earlier address and stale-DATAEND failures retained |
| Native host enumeration | Passed in later finite physical trial | Repeated replug/general endurance pending |
| Stock usbmux v2 handshake | Passed | Does not imply pairing |
| Local lockdownd connection | Earlier complete frames receive ECONNREFUSED/RST | Listener readiness and host preflight ordering |
| TCP listener census | First positive sample 41.237 s after daemon startup | Not exact bind time or an implemented listener gate |
| Ordinary pairing / info / syslog / AFC | Pending | Actual service acceptance and two-boot identity stability |

*Table 7. The latest state combines distinct dated experiments rather than pretending one capture proves every gate. Complete matched mux frames are narrower evidence than whole-usbmon completeness, which remains false. [E52](/ios/evidence/E52/) [E53](/ios/evidence/E53/) [E54](/ios/evidence/E54/) [E60](/ios/evidence/E60/)*

<figure id="figure-7"><img src="/ios/figures/usb-ladder.svg" alt="USB gates from descriptor/address to enumeration and mux handshake, then sampled listener timing; pairing and AFC remain pending" width="960" height="390" loading="lazy"/><figcaption><strong>Figure 7. The current USB frontier is a service-readiness boundary.</strong> Original schematic of physical 7E18 progress. Passed enumeration and mux gates do not promote the sampled listener into accepted ordinary pairing. The latest diagnostic has scoped success and verified recovery while its original whole-run completeness gate remains false. <a href="/ios/evidence/E52/">E52</a>, <a href="/ios/evidence/E54/">E54</a>.</figcaption></figure>

The combined listener diagnostic enumerates at host receipt 83.705 s and returns automatically to Jumpdrive at 248.893 s. Twenty-five periodic samples retain the first observed listener and genuine CommCenter check-in. Its original runner remains false because capture ownership/completion and bounded-head marker gates are incomplete. No application-level pairing success is inferred from the successful recovery. [E54](/ios/evidence/E54/)

### 7.5 Recovery, integrity and sensor diagnostics

| Named physical trial | Recovery / transition, s | Reported checked scope | Result / limit |
| --- | ---: | --- | --- |
| Pre-XNU RTC-only stall | 23.287 to Jumpdrive | SD-free recovery separately checks 12 regions, 218 files | XNU never starts; deliberate early-stall route |
| Finite sensor stream | 154.018 to Jumpdrive | 12 checked intervals, 11 immutable; 575 staged files | Immutable bytes match; finite restoration |
| Sensor shutdown sibling | 78.210 to Jumpdrive | 12 checked intervals, 11 immutable; 593 staged files | Stock drain and unique success continuation; no join/unload proof |
| Daily owner test | Not reported as a timed recovery benchmark | 12 available intervals; 593 boot files; fresh root/data fsck exit 0 | Permitted private-data changes; other protected content preserved |
| Combined listener diagnostic | 248.893 to Jumpdrive | 12 regions; 793 staged files | Protected bytes match; original whole-run/capture gate false |
| Direct EL2 reset confirmation | 1.084 EL2 → new SPL | Separate clean-volume/protected readback | One reset confirmation; ordinary repeatability pending |

*Table 8. Selected recovery and integrity reports, not an aggregate reliability percentage. Origins differ and are named explicitly. The RTC-only trial’s timing and the separately recorded SD-free integrity check are not one fabricated continuous run. Absent SD intervals are not re-read. [E46](/ios/evidence/E46/) [E48](/ios/evidence/E48/) [E51](/ios/evidence/E51/) [E54](/ios/evidence/E54/) [E55](/ios/evidence/E55/) [E56](/ios/evidence/E56/)*

The finite sensor stream records 100 samples across 14.562433 s, with an observed callback rate of 6.7983 Hz and mean axes approximately (0.041482, 0.006206, 1.026641) g. This is raw sampling in one stationary configuration, not calibrated orientation or measured hardware output data rate. No stock motion publication or owner rotation acceptance follows from these numbers. [E55](/ios/evidence/E55/)

### 7.6 Milestone chronology

| Date | Reviewed milestone | Source commit | Evidence |
| --- | --- | --- | --- |
| 1 Oct | Physical legacy Camera queue comparison | `2cd7963` | E59 |
| 2 Oct | Shared storage/AES and headless 7E18 userspace | `1258eb0`, `7cca234` | E41–E42 |
| 3 Oct | Physical userspace, stock software UI and selector | `336a454`, `1680566`, `fc8269d` | E43 |
| 4 Oct | Clean stock Camera/Photos and persistence | `c408727`, `0ebb304` | E44 |
| 5 Oct | Accepted halt, direct EL2 reset, stable selector | `969b530`, `8760690`, `d970afa` | E45–E46, E61 |
| 6 Oct | AHVBOOT growth and SD-free recovery | `0f98ebe`, `ea66db4` | E47–E48 |
| 7 Oct | Daily hand test, finite sensors and timing baseline | `0daf16b`, `7b1f989`, `967ee0a`, `1b759d0` | E50–E51, E55–E56 |
| 7 Oct | USB enumeration/mux, then sampled listener frontier | `2bf60c6`, `df891b1`, `15b3a95` | E52, E54 |

*Table 9. Commit subjects locate the engineering chronology in the pinned private corpus; validation records support the results. A commit date alone does not prove acceptance. Earlier milestones and their original publication snapshots remain in the [research timeline](/ios/timeline/).*

## 8. Case studies: useful disagreements and failures

### 8.1 A too-strict HCR check, then stale linkage

The cold-entry contract originally expected a modeled HCR state. Physical A53 readback retains SWIO as a RES1 bit. Correcting the admission rule to account for that physical value, while rejecting other unexpected HCR bits, addresses a hardware/model difference without broadly relaxing CPU policy. A zero-only test would reject valid physical state. [E42](/ios/evidence/E42/)

The next failure had a different cause. Relinking CPU helpers moved two functions while the SWP module retained old direct branch destinations. A physical candidate reached launchd and then panicked. Rebuilding the linkage against the actual loaded CPU object corrected those calls. The lesson is that a semantic fix can invalidate a placement assumption: admission must verify the complete loaded closure, not just the newly edited function. The source chapter preserves the failed candidate and repair; no binary patch recipe is published. [E42](/ios/evidence/E42/)

### 8.2 An odd checksum address and a compiler-combined STRH

The original Z2 packet writer places a trailing checksum after a variable-length body. That can make the checksum address odd. The October 3 committed rationale records that XNU enables alignment faults and that the compiler can combine adjacent writes into an unaligned halfword store. Keeping the checksum as explicit byte stores preserves the intended packet bytes without disabling alignment checks. [C62](/ios/claims/#C62)

This is a deliberately bounded case study. The available chapter/validation corpus does not provide a standalone matched QEMU-versus-hardware exception receipt for this incident. We do not invent a fault PC, exception count or elapsed time. The source/commit establishes the implementation reason; later accepted touch establishes the combined path, not every possible alignment case. That distinction is itself part of the reporting method.

### 8.3 SWP progress is not complete atomicity or a UI multiplier

An old exchange instruction can repeatedly trap on a newer core while the rest of startup looks healthy. Handling the exchange advances the observed original workload. Skipping it would substitute different synchronization semantics. The bounded accepted case still leaves faults, permissions, copy-on-write and concurrency as explicit wider questions. [E06](/ios/evidence/E06/)

A paired hotspot replay subsequently reduces mean legacy atomic traps by 98.50–99.91% across its interaction windows. Yet mean frame gaps improve in two windows and worsen in two. A local overhead reduction therefore cannot be presented as a comparable UI speedup. Instrumented trap counts answer a different question from application latency. [E39](/ios/evidence/E39/)

### 8.4 eMMC MMIO needs the right memory attributes

An early physical MMC clock update times out while the adapter uses the late mapping result directly. Remapping the two controller pages through a non-cacheable descriptor path advances the physical failure to a different controller condition. A translated address and successful mapping call were not sufficient evidence of device-access semantics. The next rejected assumption required a mode bit that the A64 eMMC controller does not implement. [E63](/ios/evidence/E63/)

This history is not a measured CPU-clock optimization. It is a correction to the device contract, followed by another actual hardware distinction. QEMU’s ability to advance through register accesses cannot establish the physical memory attribute or implemented controller feature.

### 8.5 SET_ADDRESS timing and UART instrumentation

USB requires applying the device address after genuine status completion and soon enough for the host’s next addressed transaction. USB 2.0 §9.2.6.3 permits a 2 ms recovery interval after that status stage; controller ownership cannot be replaced with a fabricated completion. Synchronous UART printing on this path can occupy the same scarce service time as EP0. The quiet control preserves protocol/MMIO behavior while reducing hot-path logging. [15](#ref-15) [E60](/ios/evidence/E60/)

The quiet trial applies and verifies FADDR 1.136083 ms after the status command; stock address dispatch takes 8.917 μs, and the host receives the addressed 18-byte descriptor. This supports logging as a latency contributor. It does not measure the status-IRQ-to-FADDR latency or prove that logging caused every failure. The next configuration request instead exposes stale DATAEND retained across STALL/new SETUP, where a strict guard rejects the state before loading configuration bytes. A timing improvement reveals a second protocol bug; it does not justify weakening the guard. [E60](/ios/evidence/E60/)

### 8.6 The caller of an identity query matters

The stock local-activation branch and the daemon’s ordinary hardware classification both query machine identity. Returning the synthetic activation response to every query in the same process conflates their purposes. The accepted policy narrows the special response to the measured activation caller and leaves the primary classification query with its stock answer. Signed text and unrelated queries remain unchanged. [E43](/ios/evidence/E43/) [E54](/ios/evidence/E54/)

The later listener diagnostic also separates a running process from an accepting socket. lockdownd remains alive, and CommCenter performs a genuine check-in with sampled run-loop activity. Those observations provide no basis to invent an absent-baseband shim or declare pairing accepted. Process existence, initialization state and listener readiness are different gates.

### 8.7 Tow-Boot has already enabled a camera rail

The initial camera admission assumed a quiescent regulator baseline. Tow-Boot’s inherited state already programs and enables the analog rail at 2.8 V, while the digital supply starts off. The earlier policy rejects that state even though it is a legitimate prerequisite for the new route. The revised 7E18 policy verifies and adopts the supported state, normalizes only owned fields, quiesces CSI/DMA and restores masked ownership. [E49](/ios/evidence/E49/)

Two identical snapshot programs compare the eMMC Tow-Boot and SD U-Boot handoffs. Twenty-six changed records are reported, but battery/SD conditions also differ and five gated display words remain unavailable. Programmed voltage selectors are not voltage measurements. The result supports explicit handoff admission; it does not prove that every difference is caused by the bootloader. Exact 4A102 camera bindings retain their separate acceptance policy.

### 8.8 A fixed delay is not listener readiness

The fixed-delay USB trial waits a measured 30.0155 s before soft-connect and still receives genuine local ECONNREFUSED/RST. It falsifies the sufficiency of that candidate. The source’s earlier broad timing interpretation is retained; it should not be rewritten into a retrospectively obvious success. [E53](/ios/evidence/E53/)

The later diagnostic first positively samples the TCP listener 41.237 s after daemon startup, while the host preflight starts earlier at attach. This supports readiness ordering as a new explanation, but the first positive sample is not the exact bind time. The activation log interval is not isolated RSA cost. A listener-gated connection is a next candidate beyond this committed publication snapshot; ordinary pairing is still pending. [E54](/ios/evidence/E54/)

There is a second negative result: an earlier kernel snapshot reaches its parent deadline without automatic recovery and needs owner reset. Later diagnostic recovery succeeds and verifies protected media, but cannot erase that failed return. The combined latest capture still has unknown host ownership and missing completion identities, so scoped diagnostic success must coexist with a false original whole-run gate. [E54](/ios/evidence/E54/)

## 9. Discussion and threats to validity

**A partial system.** The daily workflow is a substantial endpoint, but broad application coverage, GPU/GLES compatibility, audible output, Wi-Fi/Bluetooth, telephony, full suspend, motion-driven rotation and higher-detail sensor modes are not established. No Service is not proof of missing modem hardware, and an idle CPU is not proof of charging or low whole-system power. The public [capability status](/ios/status/) keeps these limits beside accepted features. [E31](/ios/evidence/E31/) [E32](/ios/evidence/E32/) [E51](/ios/evidence/E51/) [E55](/ios/evidence/E55/)

**Small and evolving sample.** Physical measurements come from one phone and a small number of named trials. Legacy camera queue windows differ in duration and startup context. The direct reset result is one confirmation. The display interval is idle and instrumented. No random order, multi-device variance, broad app benchmark or general uptime distribution is claimed. The recorded values are useful for identifying the next bottleneck, not estimating a population effect. [E46](/ios/evidence/E46/) [E50](/ios/evidence/E50/) [E59](/ios/evidence/E59/)

**The observer can change the result.** UART output is buffered for host timing and can disturb a USB hot path. A 1 ms timer request is not guaranteed callback cadence. Logging’s display sample is much larger than the idle work mean. Device RAM observations, host URBs and wire-stage ACKs are not equivalent views. A zero dropped-event counter cannot compensate for unassigned ownership or missing completion identity. [E50](/ios/evidence/E50/) [E54](/ios/evidence/E54/) [E60](/ios/evidence/E60/)

**Static inference and owner reports.** Frozen code plus a unique observed continuation can support one cleanup-route inference without proving join/unload. The first successful Camera test has owner evidence and readback but no contemporaneous UART, and no pre-reboot JPEG digest supports byte identity. Later continuous-capture daily acceptance improves that coverage without retrospectively supplying the missing earlier trace. [E44](/ios/evidence/E44/) [E51](/ios/evidence/E51/) [E56](/ios/evidence/E56/)

**Selection and publication limits.** The curated corpus is an author-reviewed record of private experiments. It is not peer review, an external replication or a complete public artifact package. Document hashes establish identity of the material reviewed, not the truth of unavailable contents. Source chapters can lag later validation; the ledger retains the more specific dated gate rather than treating the README or an old status row as uniformly current. Negative results remain visible to reduce success-only reporting.

## 10. Ethics and publication boundary

The experiments use the owner’s hardware and isolated research profiles. Synthetic research identities are kept separate from real device identities. The accepted local workflow does not contact Apple/carrier activation services, bypass signing/FairPlay or decrypt another device’s UID-bound private data. These are technical scope statements drawn from the reviewed experiments; they are not legal conclusions about every jurisdiction or potential redistribution. [E41](/ios/evidence/E41/) [E43](/ios/evidence/E43/) [E44](/ios/evidence/E44/) [E57](/ios/evidence/E57/)

This repository distributes original writing, diagrams, curated data organization and website code. It does not distribute firmware, keys, Apple implementation code, binary patches, storage images, raw sessions, credentials or private identifiers. Selected research captures retain provenance and unchanged pixels. Depicted third-party interfaces and subjects retain their original rights; MIT applies only to the repository’s original contributions. Apple names identify the software descriptively. This publication is independent and is not an Apple or PINE64 product.

AI agents assisted investigation, adapter engineering, test development and publication preparation. Their suggestions and generated prose are not experiment results. Felipe Sabino is the author responsible for the hardware work, selected publication record and its review. Claims remain tied to captures, validation and hand acceptance rather than agent confidence.

## 11. Future work

The immediate connectivity path is USB service acceptance: measure/admit listener readiness, complete ordinary private pairing, retrieve version information, sustain syslog and retrieve a saved photo over AFC with a verified hash. Replug, cancellation and lifetime behavior remain required. Only then should a stock USB-network function or a declared original CDC-ECM route establish bidirectional local traffic. Wi-Fi adds SDIO, power ownership and an exact IO80211 contract; it does not follow automatically from USB enumeration. No cellular-state fabrication is a substitute for those gates. [E52](/ios/evidence/E52/) [E54](/ios/evidence/E54/) [E57](/ios/evidence/E57/)

Motion work needs signed-axis calibration, lifetime admission, real stock HID publication and owner-visible rotation. Performance work needs matched moving-UI trials and measurements of application latency, source/expansion cost and still/JPEG cost. Genuine higher-detail sensor acquisition must precede a higher-resolution quality claim. Repeatable ordinary restart acceptance is separate from cold-power-cycle persistence. [E44](/ios/evidence/E44/) [E46](/ios/evidence/E46/) [E50](/ios/evidence/E50/) [E55](/ios/evidence/E55/)

| Ranked prospective target | Evidence at this edition | Main new gate |
| --- | --- | --- |
| 1. 3GS iOS 6.1.6 / 10B500 | Offline study; separate diskless QEMU work reaches CPUIdle and two-input dispatch, then clock-gate panic | Exact newer bindings, authentic normal boot, fresh keybag lifecycle and physical display |
| 2. iPhone 5 iOS 10.3.4 / 14G61 | Static software-renderer route and ARM32 inspection | New service/keybag contracts, larger isolated storage layout and runtime fallback |
| 3. iPhone 5s / 6 iOS 12.5.7 / 16H81 | ARM64/kernel inspection; 5s renderer inspected separately | Original AArch64 platform and SEP-dependent service contracts; no fake-key shortcut |

*Table 10. Conditional engineering ranking, not accepted ports or measured effort. Selected kernels’ 4 KiB page geometry does not establish CPU/MMU or service compatibility. The inspected 5s userland renderer does not independently validate the iPhone 6 renderer. [E57](/ios/evidence/E57/) [E58](/ios/evidence/E58/)*

The latest 10B500 QEMU work deserves a precise frontier: actual host press/release stimuli reach preserved stock keyboard dispatch and CPUIdle setup, then an absent function-clock_gate dependency panics. No authentic normal Darwin banner, root, launchd, stock reset, graphical session or physical boot is accepted. Static feasibility and this partial runtime gate are separate studies. [E58](/ios/evidence/E58/)

## 12. Reproducibility appendix

### 12.1 What a public reader can inspect

The publication repository contains the paper, companion summary, chapter atlas, original schematics, selected captured fields/images, references, claims ledger and generated portable edition. The [structured index](/ios/atlas.json) and [claim export](/ios/claims.json) preserve the editorial layer in ordinary JSON. Each evidence page links an inspectable excerpt and source identity. Its underlying complete private report and implementation are unavailable here.

An authorized independent hardware audit would require the matching licensed historical software inputs, reviewed private implementation, original A64 PinePhone, the declared eMMC/profile layout, UART/host capture equipment and verified recovery/backups. Public hardware and architecture references are necessary context but cannot reconstruct exact private bindings from their names. This paper is therefore a partial reproducibility artifact: the publication can be rebuilt and its exported claim graph checked; the native port cannot be reproduced solely from this repository.

### 12.2 Record an experiment without importing it

The record identity contains a committed source revision, source basename, SHA-256 and exact JSON pointer or selected passage locator. The report states substrate, method, inputs/control, observation, permitted mutations, recovery postconditions and remaining gates. Image provenance includes the source/output digest and bounds; the new captures in this edition are complete selected files with unchanged bytes and pixels. No run directory is imported.

Negative trials receive the same treatment. An earlier summary may remain false while a later narrower diagnostic passes. A new source revision requires a new reviewed edition or record, rather than replacement of an old conclusion. This separation makes the false enumeration checkpoint, fixed-delay failure, initial recovery failure and later listener observation simultaneously intelligible. [E52](/ios/evidence/E52/) [E53](/ios/evidence/E53/) [E54](/ios/evidence/E54/)

### 12.3 Rebuild this publication

With the repository’s pinned Node dependencies installed, run `npm test` and `npm run build`, then `npm run preview`. The build validates source references, provenance, capture digests, generated search/export and internal links under `/ios/`. Browser review covers mobile widths, both appearance modes, keyboard navigation, reduced motion, search, the concept map and evidence controls. It validates the publication experience, not the phone’s runtime. The [edition note](/ios/edition/) records this distinction and the local review state.

## 13. References

The references below are real primary sources, reviewed on 7 October 2026. Living repositories/documentation may change. They provide related-work or architectural context, not local experiment acceptance. Private experiment citations use the separate E records and [claims ledger](/ios/claims/).

1. <span id="ref-1"></span>PINE64. [PinePhone hardware documentation](https://pine64.org/documentation/PinePhone/_full/). Board and component context.
2. <span id="ref-2"></span>Linux contributors. [PinePhone board description, Linux v6.12](https://github.com/torvalds/linux/blob/v6.12/arch/arm64/boot/dts/allwinner/sun50i-a64-pinephone.dtsi). Pinned topology and supply context; not XNU validation.
3. <span id="ref-3"></span>Apple. [XNU source distribution](https://github.com/apple-oss-distributions/xnu). Architectural organization; not a certified match for the inspected historical ARM binaries.
4. <span id="ref-4"></span>Apple. [Kernel Programming Guide: Architecture](https://developer.apple.com/library/archive/documentation/Darwin/Conceptual/KernelProgramming/Architecture/Architecture.html). Mach/BSD/IOKit context.
5. <span id="ref-5"></span>Martijn de Vos and contributors. [QEMU-iOS](https://github.com/devos50/qemu-ios); the atlas also retains its [pinned original reference](https://github.com/devos50/qemu-ios/tree/501c85c4f8a3503965e38d5d4f30a02c4bc9171c). Early iPod whole-system modeling.
6. <span id="ref-6"></span>Aleph Security. [iOS on QEMU / xnu-qemu-arm64](https://github.com/alephsecurity/xnu-qemu-arm64). Related QEMU/KVM research and its stated configuration.
7. <span id="ref-7"></span>Corellium. [Getting Started](https://support.corellium.com/getting-started/). Primary description of ARM-native virtualization and CHARM.
8. <span id="ref-8"></span>touchHLE contributors. [touchHLE](https://github.com/touchHLE/touchHLE). High-level early-iOS application emulation.
9. <span id="ref-9"></span>LukeZGD and contributors. [Legacy iOS Kit](https://github.com/LukeZGD/Legacy-iOS-Kit). Preservation/restoration tooling on original devices.
10. <span id="ref-10"></span>Corellium. [Project Sandcastle](https://projectsandcastle.org/) and [published status](https://projectsandcastle.org/status). Alternative operating systems on iPhone hardware.
11. <span id="ref-11"></span>postmarketOS contributors. [PinePhone device page](https://wiki.postmarketos.org/wiki/PINE64_PinePhone_(pine64-pinephone)). Review fetch unavailable after redirect/anti-bot response; listed for ecosystem context, with no current support assertion derived from its contents.
12. <span id="ref-12"></span>Fabrice Bellard. [QEMU, a Fast and Portable Dynamic Translator](https://www.usenix.org/conference/2005-usenix-annual-technical-conference/qemu-fast-and-portable-dynamic-translator). USENIX ATC, FREENIX Track, 2005.
13. <span id="ref-13"></span>Jonas Zaddach, Luca Bruno, Aurélien Francillon and Davide Balzarotti. [Avatar: A Framework to Support Dynamic Security Analysis of Embedded Systems’ Firmwares](https://www.ndss-symposium.org/ndss2014/ndss-2014-programme/avatar-framework-support-dynamic-security-analysis-embedded-systems-firmwares/). NDSS, 2014.
14. <span id="ref-14"></span>Bo Feng, Alejandro Mera and Long Lu. [P2IM: Scalable and Hardware-independent Firmware Testing via Automatic Peripheral Interface Modeling](https://www.usenix.org/conference/usenixsecurity20/presentation/feng). USENIX Security, 2020, pp. 1237–1254.
15. <span id="ref-15"></span>Linux contributors. [MUSB peripheral EP0 handling, v6.12](https://github.com/torvalds/linux/blob/v6.12/drivers/usb/musb/musb_gadget_ep0.c). Controller completion/ordering context. USB-IF’s [USB 2.0 specification](https://www.usb.org/document-library/usb-20-specification) defines the protocol’s address-settle timing; neither reference replaces the local event trace.

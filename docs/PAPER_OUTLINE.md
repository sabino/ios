# Paper outline — edition 2.0

Reviewed source snapshot: `15b3a954f6d81eb858d0c11f372a8ae1e29d0788`, 7 October 2026. Author: Felipe Sabino. Working title: **Rehosting early iPhone OS on open mobile hardware: native execution, hardware contracts and bounded acceptance**.

## Argument and scope

The contribution is a demonstrated method and bounded physical system, not a claim of the first ever iOS execution outside an Apple device. Native AArch32 execution on the A64 is combined with original hardware providers and selective compatibility traps. It is neither instruction-by-instruction CPU emulation nor an unchanged Apple hardware platform. QEMU is a development gate; acceptance comes from named physical experiments and, where recorded, owner hand tests.

The paper preserves the 4A102 work as a historical comparison and introduces the accepted 7E18 workflow. It reports unsuccessful experiments and unresolved contracts. Private reports are curated evidence, not independent public reproductions. The claim ledger is [CLAIMS.md](CLAIMS.md), with full machine-readable provenance in `src/data/claims.json`.

## Detailed section outline

1. **Title and publication metadata.** Felipe Sabino; edition 2.0; 7 October 2026; fixed source revision. Honest note: AI agents assisted investigation, implementation, test development and editorial work; the author owns experiments, review and responsibility. Publication source is separate from the private implementation.
2. **Abstract, about 200 words.** Preservation problem → exact-build binary adaptation → physical 1.1.4/3.1.3 results → clean Camera/Photos/cold-power-cycle acceptance → idle display timing and finite sensor data → USB frontier and evidence limitations. No unexplained performance or novelty claim.
3. **Introduction.** Why historical hardware loss also loses OS behavior; why an app screenshot or kernel log is insufficient. State research question and four numbered contributions: shared adapters across builds; physical consumer contracts; recovery/integrity methodology; discriminating case studies and data.
4. **Background.** A64 Cortex-A53 with AArch32, GIC, eMMC, panel/touch, PMIC, OV5640 and MUSB; original S5L8900/ARM11 targets. XNU 933 versus 1357 exact binary identities; Mach/BSD/IOKit and service matching; historical compositor; Tow-Boot/TF-A handoff and pre-XNU NuttX initialization. Explain EL2 resident compatibility/reset separately from NuttX boot-time work. C01–C08, C41–C43, C48–C49.
5. **Related work.** Real numbered primary references: QEMU-iOS/iPod modeling; Aleph iOS-on-QEMU; Corellium ARM virtualization; touchHLE application-level preservation; Project Sandcastle in the reverse direction; Legacy iOS Kit on original hardware; PINE64/postmarketOS and mainline board drivers; Bellard dynamic translation, Avatar hybrid analysis and P2IM peripheral abstraction. Compare execution substrate, objective and validation scope. No unsupported priority claim or implication that Corellium uses CPU emulation.
6. **System design.** Layered architecture with explicit boot-time versus runtime paths. Kernel-hash-selected exact-build binding data, guarded hooks, retained stock failure paths, native driver memory reservation and isolated OS windows. Hardware algorithms shared; ABIs measured separately. Camera uses stock userland with original kernel providers. C41, C44, C47–C49.
7. **Implementation.** Nine substantive subsections, each organized as problem → solution → evidence → limit: CPU/MMU/SWP; timer/IRQ; storage/AES/AMFI ordering; stock compositor/display; input/local activation/locale; power/halt/direct reset; camera/JPEG; selector/eMMC/recovery; USB EP0/bulk/mux/listener. Add raw sensors as a clearly finite diagnostic. Cite C41–C61 and earlier E records at each boundary.
8. **Methodology and safety.** Stage/freeze → preflight/hash → bounded boot → exclusive UART/host capture → watchdog/RTC/Jumpdrive return → fresh readback/fsck → owner hand test. Explain RAM-only trials versus permitted private-data writes, immutable intervals versus intentional deltas, finite cleanup versus join/unload, and two axes of evidence classification. No statistical “success rate” assembled from overlapping reports. C47–C56, E13–E14, E24–E25, E40.
9. **Evaluation.** Scope table; selector milestones with host-receipt caveat; legacy camera queue/rate comparison; 3.1.3 capture/output dimensions; idle display timing; USB protocol ladder; selected recovery/integrity trials; finite sensor samples; dated milestone timeline supported by commits and validation. Explain controls and missing measurements beside every table/figure.
10. **Case studies.** (a) HCR SWIO RES1: correct a too-strict physical/model admission contract; stale SWP linkage after relinking is a second fault. (b) Odd Z2 checksum / compiler-combined STRH: source/commit rationale, no invented standalone UART incident. (c) SWP semantics and hot traps: progress and overhead reduction are distinct from full atomicity/UI speed. (d) Cacheable eMMC MMIO: mapping correction advances a physical timeout frontier. (e) SET_ADDRESS timing and UART: quiet control advances addressed descriptor, then stale DATAEND exposes another bug. (f) iFPGA caller scope: activation branch versus startup identity query; keep ordinary stock identity outside the narrow branch. (g) Tow-Boot regulators: adopt verified inherited state, preserve unrelated owners. (h) Fixed USB delay and listener: retain the negative result, then report sampled readiness ordering and incomplete capture.
11. **Discussion.** Single device/operator, unequal preview windows, instrumentation perturbation, partial model, static-versus-dynamic inference, owner reports and first Camera UART gap, no pre-reboot 3.1.3 JPEG hash, no broad app suite. GPU, audio output, Wi-Fi/Bluetooth, telephony, suspend, camera detail modes and stock rotation remain open. Native instruction execution does not imply zero virtualization/trap overhead.
12. **Ethics and publication boundary.** Owner’s hardware; synthetic research identities; no Apple/carrier activation traffic; no signature/FairPlay bypass; no distribution of firmware, keys, Apple implementation, raw runs or private identifiers. Names used descriptively; independent publication. No legal conclusion inferred from technical boundaries.
13. **Future work.** Listener-aware USB admission and ordinary pairing/AFC → bounded local networking → exact Wi-Fi contracts; lifetime/calibration/rotation; responsive UI and real higher-detail capture; separate accepted restart trials. Ranked 3GS 6.1.6 → iPhone 5 10.3.4 → 5s/6 12.5.7; fresh keybags and new ABIs remain gates. Separate current 10B500 diskless QEMU clock-gate frontier. C54–C58.
14. **Reproducibility appendix.** Public publication code/data/selected captures versus private implementation and licensed software; required hardware/capture/recovery inputs for an authorized audit; source basename/hash/JSON pointer/commit and image crop provenance; how to rerun publication checks. Hashes identify reviewed private inputs but cannot verify their unavailable contents.
15. **Numbered references.** Each external claim links to a real primary source; versions pinned where applicable; living pages accessed 7 October 2026. Mark the postmarketOS wiki as unavailable to the review fetch if it remains inaccessible and use readable official device documentation/mainline DTS for board claims. Private records cited as E IDs, not disguised as public literature.

## Figures

| ID | Planned content | Source and caption limit |
| --- | --- | --- |
| F1 | Existing interactive PLATE 01 / layer explorer, updated for two builds | Original schematic. Three substrates retain separate results; arrows are explanatory organization, not measured call edges. |
| F2 | Native architecture and boot/recovery routes | Original SVG. A64 → firmware → pre-XNU NuttX → AArch32 XNU/providers → stock userland; resident EL2/reset and Jumpdrive recovery drawn as distinct branches. E41–E49. |
| F3 | Reviewed 7E18 lock/home QEMU pixels and physical Camera screenshot | Only genuine selected media with input/output SHA-256, source basename, bounds and substrate. QEMU capture never labeled a physical photograph. If no reviewed selector capture is available, use a labeled original route diagram, not a fabricated selector screenshot. |
| F4 | Experimental trial and recovery loop | Original schematic from E47–E56/E40. Finite diagnostic deadlines remain separate from normal profiles with runtime watchdogs off. |
| F5 | Legacy native-delivery, selected-image and panel-update rates, two versus six slots | Original bars from E59 selected fields. 1.1.4 only, one pair, unequal intervals; counters do not prove individual displayed camera frames. |
| F6 | Idle presentation timing | Original bars from E50. 64 later presentations, zero sampled changes, elapsed counter timing. Logging’s one sample shown separately; no animation FPS. |
| F7 | USB protocol and acceptance ladder | Original schematic from E52–E54/E60. Enumeration and mux pass; listener sampled later; ordinary pairing/AFC remain pending. |

Every figure will have a self-contained caption naming build, substrate, measurement boundary and limit.

## Tables

| ID | Columns / purpose | Evidence |
| --- | --- | --- |
| T1 | Software build; original CPU; XNU identity; adaptation boundary | E01, E41; exact-target inspection |
| T2 | Substrate; method; accepted scope; unaccepted scope | E01–E63 and claims ledger |
| T3 | Selector milestone; buffered host-receipt seconds; interpretation | E43; one physical default-choice trial |
| T4 | Legacy queue; native deliveries; selected images; updates; interval | E59; no 3.1.3 FPS extrapolation |
| T5 | Camera acquisition; preview; still geometry; acceptance | E44, E51; resampling is explicit |
| T6 | Display component; samples; mean ms; scope | E50 |
| T7 | USB gate; observed outcome; remaining acceptance | E52–E54/E60 |
| T8 | Named trial; recovery timing origin; checked regions/files; integrity | E46, E48, E51, E54–E56; no aggregate denominator |
| T9 | Date; milestone; commit; evidence | Pinned commit subjects plus validation |
| T10 | Candidate; evidence class; reusable work; new gates; frontier | E57–E58; conditional engineering ranking |

## Companion and integration work

- Accessible summary: what runs, what “native” means, what a photograph and cold boot establish, what remains open, and how to read the evidence.
- Edition note: explicit 2.0 snapshot, retained E01–E40, new E41–E63, corrected current frontiers and 3.1.3 resampling/acceptance caveats.
- Update capability data, homepage, device showcase, timeline, search/export, sources and dated updates to affected chapters. Preserve existing layer interactions, concept-map relationships and original record IDs.
- Build/test, local preview, mobile/light/dark, keyboard, reduced motion, navigation/search/map and citation/link checks. Commit as `sabino` with no co-author line. No push or deployment before preview approval.

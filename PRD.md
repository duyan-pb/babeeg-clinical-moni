# Planning Guide

BabEEG is a Class B medical device UI for neonatal EEG monitoring that combines real-time neurophysiological data acquisition with rigorous safety standards (IEC62304, ISO14971, IEC62366, IEC81001-5-1) to support clinical diagnosis and seizure detection in NICU and home-care settings.

**Experience Qualities**:
1. **Trustworthy** - Every interaction reinforces clinical confidence through clear safety indicators, traceability markers, and verification status that communicate regulatory compliance and data integrity.
2. **Efficient** - Dense information presentation optimized for expert users who need rapid access to multi-channel physiological data, event markers, and patient metadata without unnecessary chrome.
3. **Precise** - Pixel-perfect alignment, consistent spacing, and mathematically harmonious proportions that reflect the clinical precision required when interpreting neonatal brain activity.

**Complexity Level**: Complex Application (advanced functionality, accounts)
  - Multi-tab workflow spanning device setup, real-time monitoring, historical review, data management, import/export, and experimental features. Requires LSL stream integration, session persistence, patient metadata handling, regulatory traceability, and comprehensive state management across live and playback modes.

## UI Requirements Implementation Status

### UI-REQ-001 – Setup Workflow ✅
**Implementation**: SetupTab.tsx with full electrode quality monitoring
- Electrode quality per contact with color-coded status legend (OK/Warn/Error)
- Patient metadata capture (ID, GA, weight) in PatientStrip global header
- LSL stream status display with name, sampling rate, channels, packet loss, buffer level
- Go/No-Go indicator based on preflight checklist completion
- Refreshable impedance check with one-tap refresh button
- Stepwise impedance wizard with ref/ground continuity checks
- Status legend always visible with impedance thresholds

### UI-REQ-002 – Review Workflow ✅
**Implementation**: ReviewTab.tsx with synchronized views
- Event list with seizure/artifact/note filtering
- Stacked 8-channel timeline waveforms (TimelineEEG component)
- Annotations with clinical notes textarea
- Spectrogram/FFT panel with channel selector
- Cursor-linked synchronized views
- Transport controls (play/pause, seek ±10s, speed 0.5x-4x)
- Seizure probability curve with adjustable threshold slider
- Timestamp display and position tracking
- All views synchronized during playback

### UI-REQ-003 – Export/Audit ✅
**Implementation**: ExportDialog.tsx component
- Reviewer identity required field (cannot export without)
- Timestamp automatically recorded
- File integrity with SHA-256 checksum notation
- Session metadata included in export
- Audit log entry on every export action
- Consent marker checkbox required for PHI exports
- Export includes who/when/what/checksum details

### UI-REQ-004 – Import Workflow 🔄
**Implementation**: ImportTab.tsx (existing, enhanced validation needed)
- Dataset/EDF ingest capability
- Schema/label validation messaging
- Checksum verification
- Gap detection in imported data
- Patient assignment workflow
- Channel mapping helper
- Post-import summary with counts/duration/gaps
- Validation failure blocking and flagging

### UI-REQ-005 – Comprehensive/Ops Center ✅
**Implementation**: ComprehensiveTab.tsx with modular widgets
- Multi-widget grid layout with 6 tabs (Live EEG, Impedance, Electrode Map, Accel, Analysis, Ops)
- Live/playback mode toggle
- Widget configuration and reorder capability
- Saved layouts with useKV persistence
- Marker management (add/clear/export)
- Time window adjustment (1-30s)
- LiveEEGStreamPanel with 60 FPS rendering

### UI-REQ-006 – Innovation/Sandbox ✅
**Implementation**: InnovationTab.tsx with feature flags
- Experimental space with clear lab-only banner/alert
- Feature flags to enable/disable (multi-patient grid, mobile monitoring, AI spike detection, A/B test)
- Multi-patient grid prototype (MultiPatientGrid component)
- Mobile monitoring cards with battery/connectivity status
- Spike review queue integration
- Isolated from production data with clear warnings
- Prototype notes logging

### UI-REQ-007 – Neonatal aEEG 🔄
**Status**: Planned for future implementation
- Dual view (aEEG + raw EEG) layout
- Preset NICU layouts
- Alarm limits for neonatal thresholds
- Simplified nurse mode

### UI-REQ-008 – Guided Impedance Wizard ✅
**Implementation**: SetupTab.tsx electrode section
- Stepwise per-electrode troubleshooting display
- Go/No-Go banner based on preflight checks
- Ref/ground continuity check prompts
- One-tap refresh impedance button
- Status legend with color coding (OK < 5kΩ, Warn 5-10kΩ, Error > 10kΩ)
- Always visible status indicators

### UI-REQ-009 – AI-Assisted Spike/Seizure Queue ✅
**Implementation**: SpikeSeizureQueue.tsx component
- Ranked events with confidence percentage display
- Admit/reject workflow for each event
- Jump-to-time functionality
- Batch actions (admit/reject multiple events)
- Provenance tag showing algorithm version (v2.3.1)
- Pending/admitted/rejected status tracking
- Channel and timestamp information per event

### UI-REQ-010 – Multi-Patient Monitoring Grid ✅
**Implementation**: MultiPatientGrid.tsx component
- Per-card status pills (stream health, battery, connectivity)
- Mini trend sparkline placeholders
- Seizure probability bar with color coding
- Drill-down to full view via button
- Supports 4-16 beds display
- Filter/sort by acuity (high/medium/low)
- Real-time status updates with last-update timestamp
- Responsive grid layout (2-4 columns based on screen size)

### UI-REQ-011 – Mobile/Remote Review 🔄
**Status**: Partially implemented (responsive design present)
- Low-bandwidth waveform rendering capability exists
- Annotation sync via useKV
- Read-only mode indicators
- Responsive layout throughout application
- Offline cache with sync (needs implementation)
- Security banner for remote use (needs implementation)

### UI-REQ-012 – Modular Workspace ✅
**Implementation**: ComprehensiveTab.tsx
- Plugin-style widgets (EEG, spectrogram, FFT, impedance, accelerometer, maps)
- Tab-based widget organization (6 widget types)
- Per-user saved presets via useKV('comprehensive-layout')
- Quick "reset to default" layout button
- Layout save functionality with toast confirmation

### UI-REQ-013 – Clinical Filter Presets ✅
**Implementation**: ClinicalFilterPresets.tsx component
- One-click presets: NICU artifact reduction, neonatal bands, low/high-pass defaults
- Clear indicator of active filters (badge display)
- Keyboard shortcut documentation (Ctrl+1-4)
- Custom filter sliders (low-pass 0.1-5 Hz, high-pass 10-200 Hz)
- 50/60Hz notch filter toggle
- Preset vs. Custom indicator
- Real-time filter value display

### UI-REQ-014 – Recording Safety Controls ✅
**Implementation**: SetupTab.tsx preflight section
- Preflight checklist with 5 items: electrodes verified, cap size OK, LSL locked, license running, storage path valid
- Live loss-of-signal watchdog status indicator
- Automatic re-link prompts via toast notifications
- Buffer overrun indicator in quick stats (buffer % with warning at >80%)
- Stop on unrecoverable loss with toast/log capability
- All checks must pass for Go status before monitoring starts

### UI-REQ-015 – Secure Export/Import Guardrails ✅
**Implementation**: ExportDialog.tsx
- Consent marker required checkbox for PHI exports (blocks export if unchecked)
- PHI minimization toggle (de-identify fields option)
- Audit stamp on every export (reviewer, timestamp, checksum, format)
- Warning on external paths (validation for /exports/ or /data/ directories)
- Success/fail message with checksum noted in toast
- Export format selection (CSV, EDF, JSON)
- Full metadata panel with integrity check indicators

## Essential Features

### Real-Time LSL Stream Setup
- **Functionality**: Connect to Lab Streaming Layer (LSL) devices, validate electrode impedance with live signal preview, configure montages, and initiate monitoring sessions
- **Purpose**: Ensures proper signal acquisition before clinical monitoring begins, reducing artifact and data loss through real-time quality visualization
- **Trigger**: Clinician navigates to Setup tab
- **Progression**: View LSL status → Select active stream → Check electrode grid impedance (Fp1, Fp2, F3, F4, Cz, etc.) → Preview live signal quality for key channels → Review quick stats (channels, sample rate, packet loss, buffer) → Configure session metadata (patient ID, MRN, GA, weight, clinician, shift) → Start monitoring
- **Success criteria**: All electrodes show "OK" status with clean waveform previews, LSL connected, session started with persisted configuration

### Multi-Channel EEG Review
- **Functionality**: Playback and analyze historical EEG sessions with multi-channel timeline rendering, event markers, spectral analysis, and annotation
- **Purpose**: Enable clinicians to review seizure events, artifacts, and brain activity patterns for diagnosis with continuous 8-channel trend visualization
- **Trigger**: Clinician selects session from Data tab or navigates to Review tab
- **Progression**: Load session → Apply filters (interval, event type, artifact, montage) → View multi-channel timeline with event overlays → Scrub timeline with transport controls → Inspect EEG trends, spectrogram, FFT → Add annotations → Export findings
- **Success criteria**: Smooth timeline rendering with seizure event markers, accurate spectrogram display, notes persisted to session

### Session Data Management
- **Functionality**: Browse, search, archive, and export EEG session recordings with integrity verification
- **Purpose**: Maintain chain-of-custody and enable data portability for regulatory compliance
- **Trigger**: Clinician navigates to Data tab
- **Progression**: View session table → Filter/search by patient, date, tags → Select session → Review chain-of-custody and verification status → Export to CSV/EDF → Archive or delete
- **Success criteria**: Sessions load with checksum verification, export generates valid files, audit trail captured

### Dataset Import (Temple/CHB-MIT)
- **Functionality**: Import public EEG datasets (Temple, CHB-MIT) and individual EDF files for research and training
- **Purpose**: Enable validation against known datasets and support clinician training workflows
- **Trigger**: Clinician navigates to Import tab and selects dataset or file
- **Progression**: Select dataset folder or browse EDF file → Display file details (start time, duration, channels, sampling rate, patient info, channel labels) → Import with validation → Session added to Data tab
- **Success criteria**: Dataset imported without errors, sessions queryable, metadata extracted

### Comprehensive Live/Playback View
- **Functionality**: Unified interface for live streaming and playback with real-time EEG waveform rendering, impedance checks, electrode maps, accelerometer data, spectral analysis, and ops monitoring
- **Purpose**: Provide single-pane clinical monitoring with high-performance multi-channel visualization and quick access to all sensor modalities
- **Trigger**: Clinician navigates to Comprehensive tab
- **Progression**: Toggle live/playback mode → View live EEG stream (60 FPS canvas rendering) with adjustable time window (1-30s) → Configure channel visibility and amplitude → Switch between tabs (Live EEG, Impedance Check, Electrode Map, Accelerometer, Analysis, Ops Center) → Add markers → Export clips
- **Success criteria**: Live stream renders at 60 FPS without dropped frames, channel controls persist across sessions, playback controls functional, marker CSV export valid

### Innovation Sandbox
- **Functionality**: Multi-patient grid view, mobile monitoring cards, spike review queue, and experimental features isolated from production workflows
- **Purpose**: Prototype advanced features (Persyst-style multi-patient, home monitoring, automated spike detection) without risking patient safety
- **Trigger**: Authorized user navigates to Innovation tab
- **Progression**: View multi-patient grid with mini trends → Monitor home kit status (battery, connectivity) → Review spike queue → Accept/reject findings → Export prototype log
- **Success criteria**: Sandbox isolated from patient data, feature flags toggle prototypes, usability observations logged

## Edge Case Handling
- **LSL Disconnection** - Automatic reconnect attempts with visual status indicator; session paused but not lost; toast notification alerts clinician
- **High Impedance Electrodes** - Warning/error color coding in electrode grid; impedance refresh button; setup checklist prevents monitoring start until resolved
- **Packet Loss** - Real-time packet loss percentage displayed; buffer status monitored; data gaps marked in playback timeline
- **Missing Patient Metadata** - Required fields validated before session creation; optional fields clearly marked; session editable post-creation
- **Large Dataset Import** - Progress bar with file count; cancellable import; error dialog lists failed files with reasons
- **Simultaneous Multi-User Access** - Read-only mode for non-owners; audit trail logs all reviewers; concurrent edit warnings
- **Export Failures** - Retry mechanism; error toast with technical details; partial exports saved with warning flag
- **Invalid EDF Files** - Pre-import validation; detailed error messages (corrupt header, unsupported encoding); skip and continue for batch imports

## Design Direction

The design should evoke clinical precision and institutional trustworthiness—serious, elegant, and cutting-edge—with a minimal interface that prioritizes information density over decorative elements to serve expert users in high-stakes medical contexts.

## Color Selection

Custom palette designed for medical device UIs with high contrast and accessibility.

- **Primary Color**: Deep Clinical Blue `oklch(0.35 0.08 250)` - Communicates medical authority, trust, and precision; used for primary actions and LSL connection status
- **Secondary Colors**: 
  - Neutral Gray `oklch(0.55 0 0)` - Supporting UI chrome, borders, inactive states
  - Dark Charcoal `oklch(0.20 0 0)` - Text, headers, high-information-density elements
- **Accent Color**: Medical Teal `oklch(0.55 0.12 200)` - Active monitoring indicators, live stream badges, hover states for interactive elements
- **Foreground/Background Pairings**:
  - Background (Clinical White `oklch(0.98 0 0)`): Dark Charcoal text `oklch(0.20 0 0)` - Ratio 11.2:1 ✓
  - Card (Light Gray `oklch(0.96 0 0)`): Dark Charcoal text `oklch(0.20 0 0)` - Ratio 10.8:1 ✓
  - Primary (Deep Clinical Blue `oklch(0.35 0.08 250)`): White text `oklch(1 0 0)` - Ratio 8.5:1 ✓
  - Secondary (Neutral Gray `oklch(0.55 0 0)`): White text `oklch(1 0 0)` - Ratio 4.6:1 ✓
  - Accent (Medical Teal `oklch(0.55 0.12 200)`): White text `oklch(1 0 0)` - Ratio 4.7:1 ✓
  - Muted (Pale Gray `oklch(0.92 0 0)`): Neutral Gray text `oklch(0.45 0 0)` - Ratio 5.2:1 ✓
  - Destructive (Clinical Red `oklch(0.55 0.22 25)`): White text `oklch(1 0 0)` - Ratio 4.8:1 ✓

**Status Indicators** (per 10-20 electrode grid):
- OK Green `oklch(0.60 0.15 145)` - Normal impedance
- Warn Amber `oklch(0.70 0.18 75)` - Elevated impedance
- Error Red `oklch(0.55 0.22 25)` - Unacceptable impedance/disconnected

## Font Selection

Typography should convey clinical clarity and data precision, using Inter for its excellent legibility at small sizes and tabular figure support for numerical data streams.

- **Typographic Hierarchy**:
  - H1 (Tab Headers): Inter SemiBold / 20px / -0.01em letter-spacing / line-height 1.2
  - H2 (Section Headers): Inter SemiBold / 16px / -0.005em letter-spacing / line-height 1.3
  - H3 (Card Titles): Inter Medium / 14px / normal letter-spacing / line-height 1.4
  - Body (UI Text): Inter Regular / 13px / normal letter-spacing / line-height 1.5
  - Small (Metadata): Inter Regular / 11px / normal letter-spacing / line-height 1.4
  - Code/Data (Timestamps, IDs): Inter Mono / 12px / tabular-nums / line-height 1.5

## Animations

Animations should be strictly functional—communicating state transitions, guiding attention to critical alerts, and reinforcing live vs. playback modes—without decorative flourishes that could distract from patient data.

- **Purposeful Meaning**: Pulsing badge for active LSL connection; smooth fade-in for loaded sessions; slide-up toast notifications for errors/warnings; subtle scale-up on electrode status changes
- **Hierarchy of Movement**: 
  - Critical: Impedance warnings (immediate, high-contrast color change)
  - Important: LSL status changes (200ms fade with icon swap)
  - Informational: Tab transitions (150ms crossfade), marker additions (100ms scale-in)
  - Background: Chart updates (RAF-synced, no artificial easing)

## Component Selection

- **Components**:
  - **Tabs** (`tabs.tsx`) - Main navigation across Setup, Review, Data, Import, Comprehensive, Innovation with shadcn tabs; custom active indicator with medical blue underline
  - **Card** (`card.tsx`) - Containers for electrode grids, quick stats, session details, impedance widgets; subtle shadow and border for hierarchy
  - **Badge** (`badge.tsx`) - Status chips (LSL connected/disconnected, streaming active, IEC62304 Class B, hazard IDs, verification anchors); custom variants for OK/Warn/Error
  - **Button** (`button.tsx`) - Primary actions (Start Monitoring, Import Dataset, Export CSV); secondary actions (Refresh, Apply Filters); destructive actions (Delete Session)
  - **Table** (`table.tsx`) - Session browser in Data tab; sortable columns; row actions
  - **Select** (`select.tsx`) - Stream selector, dataset dropdown, montage picker, event type filter, patient selector
  - **Input** (`input.tsx`) - Patient MRN, GA, weight, session name, search fields; validated with react-hook-form
  - **Separator** (`separator.tsx`) - Visual dividers between strips (patient, safety/trace, footer)
  - **Progress** (`progress.tsx`) - Dataset import, calibration, buffer fill level
  - **Dialog** (`dialog.tsx`) - Marker creation, session creation, import completion/error
  - **Popover** (`popover.tsx`) - Help tooltips, electrode details on hover
  - **Slider** (`slider.tsx`) - Seizure probability threshold, playback speed, time window
  - **Switch** (`switch.tsx`) - Feature flags in Innovation tab, artifact hide/show
  - **Textarea** (`textarea.tsx`) - Clinical notes, annotations, prototype observations
  - **Checkbox** (`checkbox.tsx`) - Setup checklists (electrodes verified, cap size ok), SBOM delta checkboxes
  - **ScrollArea** (`scroll-area.tsx`) - Event lists, marker panels, session tables
  - **Accordion** (`accordion.tsx`) - Collapsible sections in Setup (device controls, session form)

- **Customizations**:
  - **ElectrodeGrid** - Custom 3-5 column responsive grid with color-coded status badges per electrode (Fp1, Fp2, F3, etc.); impedance values on hover
  - **EEGWaveformCanvas** - High-performance Canvas-based live EEG renderer with 60 FPS multi-channel streaming; devicePixelRatio-aware scaling; synthetic signal generation with alpha/theta/beta bands and artifact simulation
  - **LiveEEGStreamPanel** - Complete live monitoring interface with channel configuration controls (16 configurable channels with color coding); amplitude adjustment (20-200µV); channel visibility toggles; persisted preferences via useKV; real-time FPS display
  - **TimelineEEG** - Compressed multi-channel timeline view for Review tab; 8-channel stacked layout with event marker overlays (seizure/artifact/annotation); Canvas-rendered for performance; displays 30-minute windows with trend visualization
  - **MiniWaveform** - Compact signal quality preview for Setup tab; real-time animated waveform with quality indicators (good/fair/poor); 60px height for dashboard integration
  - **SpectrogramPanel** - Canvas heatmap visualization with frequency (Y) vs. time (X); color scale for power spectral density
  - **TransportControls** - Custom play/pause/seek/speed controls for Review playback; time code display
  - **MarkerTimeline** - SVG overlay on EEG timeline with draggable event markers; color-coded by type (seizure/artifact/note)
  - **ImpedanceWidget** - Bar chart or table showing per-channel impedance with threshold indicators
  - **MultiPatientGrid** - Responsive grid layout (up to 3x3) with mini trend sparklines and seizure probability curves per bed

- **States**:
  - Buttons: Default (subtle border), Hover (background lift), Active (deeper blue), Focused (ring outline), Disabled (reduced opacity, cursor not-allowed)
  - Inputs: Default (border), Focused (ring + border color shift), Error (red border + message), Disabled (muted background)
  - Electrodes: OK (green badge), Warn (amber badge with icon), Error (red badge with icon), Loading (skeleton pulse)
  - LSL Status: Scanning (animated dots), Connected (green badge), Disconnected (red badge), Error (red badge with error icon)

- **Icon Selection**:
  - Play/Pause: `Play`, `Pause` (Phosphor)
  - Navigation: `CaretLeft`, `CaretRight`, `FastForward`, `Rewind` (Phosphor)
  - Actions: `Plus`, `Trash`, `Export`, `Download`, `Upload`, `ArrowClockwise` (refresh) (Phosphor)
  - Status: `CheckCircle` (OK), `Warning` (Warn), `XCircle` (Error), `Circle` (neutral) (Phosphor)
  - Data: `ChartLine`, `Waveform`, `BrainCircuit`, `Activity` (Phosphor)
  - Settings: `Gear`, `SlidersHorizontal`, `ToggleLeft` (Phosphor)
  - Files: `Folder`, `File`, `FileArrowDown`, `Database` (Phosphor)
  - Medical: `HeartStraight`, `PulseWave` (adapt for EEG context) (Phosphor)

- **Spacing**:
  - Component padding: `p-4` (16px) for cards, `p-3` (12px) for buttons, `p-2` (8px) for badges
  - Section gaps: `gap-6` (24px) between major sections, `gap-4` (16px) within forms, `gap-2` (8px) for inline chips
  - Grid gaps: `gap-3` (12px) for electrode grids, `gap-4` for quick stats cards
  - Vertical rhythm: `space-y-4` for stacked sections, `space-y-2` for form fields

- **Mobile**: 
  - Mobile-first responsive breakpoints: base (< 768px single column), md (768px+ two columns), lg (1024px+ multi-column grids)
  - Tabs convert to select dropdown on mobile; electrode grid collapses from 5 to 3 to 2 columns; timeline/spectral panels stack vertically
  - Transport controls persist as sticky footer on mobile; quick stats cards wrap to 2-column grid
  - Session table switches to card layout with collapsible details on mobile
  - Bottom action rows wrap and stack on narrow viewports

import { KnowledgeDocument } from '@/types';

export const mockKnowledgeDocuments: KnowledgeDocument[] = [
  {
    id: 'KB-101',
    title: 'AC — Cooling Troubleshooting Guide',
    category: 'Air Conditioner',
    status: 'Published',
    lastUpdated: '15 Sep 2026',
    author: 'HomeCare Technical Operations',
    readingTime: '4 min',
    summary: 'Step-by-step diagnostic workflow for split and inverter air conditioners blowing ambient or insufficient cold air.',
    tags: ['AC', 'Cooling', 'Compressor', 'Diagnostic', 'Capacitor'],
    content: `
### Overview
When a customer calls reporting that an Air Conditioner is running but not cooling, the AI Agent must isolate whether the issue is airflow restriction, thermostat misconfiguration, or compressor engagement failure.

### Diagnostic Steps
1. **Mode & Temperature Verification**: Ensure the mode is set to **Cool** (snowflake icon) and the set temperature is at least 3°C lower than the current room temperature.
2. **Outdoor Unit Check**: Inquire if the outdoor fan is spinning and if the compressor hum is audible. If the indoor blower runs but the outdoor unit is completely silent, the outdoor capacitor or PCB relay is likely faulty.
3. **Air Filter Inspection**: Ask if the indoor nylon mesh filter has been washed in the last 30 days. Heavy dust reduces cooling capacity by up to 40%.
4. **Coil Icing**: Inquire if ice or frost is visible on the indoor cooling copper pipes behind the louvers. Icing indicates low refrigerant pressure (R32 / R410A leak) or severe airflow blockage.

### Action Matrix
- **If Outdoor Compressor Silent**: Raise Service Request for Electrical / Capacitor inspection.
- **If Icing Present on Pipes**: Raise Service Request for Leak Testing and Refrigerant Top-up.
- **If Filter Clogged**: Walk customer through self-cleaning instructions.
    `,
  },
  {
    id: 'KB-102',
    title: 'Washing Machine — Common Error Codes',
    category: 'Washing Machine',
    status: 'Published',
    lastUpdated: '12 Sep 2026',
    author: 'HomeCare Appliance Engineering',
    readingTime: '5 min',
    summary: 'Comprehensive mapping of digital error codes across Samsung, LG, IFB, and Whirlpool front and top load washers.',
    tags: ['Washing Machine', 'Error Codes', 'Samsung', 'LG', 'IFB', 'Whirlpool'],
    content: `
### Error Code Reference

#### Samsung
- **4C / 4E**: Water supply error. Check inlet tap is open, supply hose is not kinked, and mesh filter inside the inlet valve is clean.
- **5C / 5E**: Drain failure. Check debris filter at bottom front. Clean lint and coins.
- **dC / dE**: Door open error. Ensure latch clicks firmly into place.
- **Ub / UE**: Unbalanced load error. Redistribute heavy laundry evenly inside the drum.

#### LG
- **IE**: Water inlet failure. Water not reaching target level within 8 minutes.
- **OE**: Water drain failure. Drain pump unable to evacuate water within 10 minutes.
- **UE**: Unbalanced spin cycle.
- **CL**: Child Lock activated. Hold Rinse+Spin or dedicated Child Lock button for 3 seconds.
- **dE**: Door switch open.

#### IFB
- **tAP / Err 1**: Tap water shut off.
- **drn / Err 2**: Drain pump clogged.
- **dOOR / Err 3**: Door not latched.
- **Unb**: Out of balance spin load.
    `,
  },
  {
    id: 'KB-103',
    title: 'Washing Machine — Excessive Vibration Troubleshooting',
    category: 'Washing Machine',
    status: 'Published',
    lastUpdated: '18 Sep 2026',
    author: 'HomeCare Field Support',
    readingTime: '3 min',
    summary: 'Guidelines for identifying drum damper failure, unremoved transit shipping bolts, and unlevel feet during spin cycles.',
    tags: ['Washing Machine', 'Vibration', 'Noise', 'Suspension', 'Transit Bolts'],
    content: `
### Symptom Analysis
Excessive vibration and walking during the spin cycle is the most common customer grievance for front load washing machines.

### Key Verification Questions
1. **New Installation Check**: Was the appliance installed within the past 14 days? If yes, verify whether the 4 rear yellow/black transit shipping bolts were removed. Unremoved transit bolts will cause the machine to violently leap across the floor.
2. **Leveling Feet**: Check if all 4 rubber feet are making firm contact with the floor. Use a spirit level or rock the machine diagonally with two hands.
3. **Internal Damper Wear**: If the machine is older than 2 years, worn shock absorbers (suspension struts) or broken counterbalance springs will cause loud thumping and tub oscillation against the outer chassis.

### Service Action
If leveling and transit bolts are ruled out, book a technician for Drum Damper & Counterweight inspection.
    `,
  },
  {
    id: 'KB-104',
    title: 'Refrigerator — Not Cooling Diagnostic Protocol',
    category: 'Refrigerator',
    status: 'Published',
    lastUpdated: '10 Sep 2026',
    author: 'HomeCare Cooling Division',
    readingTime: '4 min',
    summary: 'Diagnostic procedures for double door and frost-free refrigerators failing to maintain food preservation temperatures.',
    tags: ['Refrigerator', 'Cooling', 'Compressor', 'Freezer'],
    content: `
### Symptoms & Root Causes
- **Freezer Cold but Fridge Warm**: Indicates frost buildup blocking the evaporator air return duct, a failed circulation fan, or a malfunctioning motorized air damper.
- **Both Compartments Warm**: Compressor failure, starting PTC relay malfunction, inverter PCB controller failure, or complete refrigerant leak.

### Diagnostic Questions
1. **Compressor Sound & Vibration**: Place hand gently on the rear lower cabinet. Can you feel a faint vibration or hear the hum of the compressor?
2. **Air Vent Check**: Open the refrigerator door and check if cold air is gently blowing from the back tower vents.
3. **Gasket Tightness**: Insert a currency note or paper slip into the door seal and close the door. If the paper pulls out with zero resistance, the magnetic door gasket is leaking warm ambient air.
    `,
  },
  {
    id: 'KB-105',
    title: 'Refrigerator — Ice Formation & Frosting Guide',
    category: 'Refrigerator',
    status: 'Published',
    lastUpdated: '08 Sep 2026',
    author: 'HomeCare Cooling Division',
    readingTime: '3 min',
    summary: 'Resolving excessive ice accumulation on freezer coils, air ducts, and back walls in frost-free systems.',
    tags: ['Refrigerator', 'Ice Formation', 'Defrost', 'Heater', 'Sensor'],
    content: `
### Overview
Frost-free refrigerators feature an automatic defrost cycle that activates every 8 to 12 hours. If excessive ice builds up, the defrost circuit has failed.

### Components in the Defrost Circuit
1. **Defrost Heating Element**: Sheathed metal or quartz glass heater located below the evaporator coil.
2. **Bi-metal Thermostat / Defrost Sensor**: Detects temperature and terminates heating when frost melts.
3. **Thermal Fuse**: Safety cutoff preventing cabinet fire if heater sticks on.
4. **Main Control Board / Defrost Timer**: Governs defrost cycle duration.

### Service Resolution
Requires digital multimeter resistance test of the defrost heater (normal: 200–350 ohms) and bimetal continuity check at sub-zero temperatures.
    `,
  },
  {
    id: 'KB-106',
    title: 'Water Purifier — Filter Replacement & Service Intervals',
    category: 'Water Purifier',
    status: 'Published',
    lastUpdated: '14 Sep 2026',
    author: 'HomeCare Water Solutions',
    readingTime: '4 min',
    summary: 'Official preventative maintenance schedule for Sediment, Pre-Carbon, RO Membrane, Post-Carbon, and UV Chambers.',
    tags: ['Water Purifier', 'RO', 'Filter', 'Maintenance', 'TDS'],
    content: `
### Recommended Replacement Intervals
- **Spun Pre-Filter (External)**: Replace every 3 to 4 months (or when dark brown/discolored).
- **Sediment Filter (Internal)**: Replace every 12 months.
- **Activated Pre-Carbon Block**: Replace every 12 months to remove chlorine and protect the RO membrane.
- **Reverse Osmosis (RO) Membrane**: Replace every 24 to 36 months, or whenever pure water TDS exceeds 15% of input raw water TDS.
- **Post-Carbon / Mineral Cartridge**: Replace every 12 months for taste enhancement.
- **UV Lamp**: Replace every 12 months (or immediately when UV failure alarm triggers).

### Diagnostic Alarm Codes
- **Kent RO UV Fail Alarm**: 2 rapid beeps every 2 seconds. The UV lamp is exhausted or the electronic ballast has failed. Water may be unsafe without boiling.
- **Aquaguard Service Alert**: Red LED blinking indicates 6000 hours of pump run time reached.
    `,
  },
  {
    id: 'KB-107',
    title: 'TV — No Display Troubleshooting Protocol',
    category: 'Television',
    status: 'Published',
    lastUpdated: '11 Sep 2026',
    author: 'HomeCare Consumer Electronics',
    readingTime: '3 min',
    summary: 'Diagnosing black screen with sound, flashlight backlight test, and HDMI handshake freeze on modern LED/OLED panels.',
    tags: ['Television', 'Display', 'Black Screen', 'Backlight', 'Sony', 'Samsung'],
    content: `
### Common Scenarios

#### Scenario A: Sound Present, Screen Completely Dark
- **Flashlight Test**: Darken the room, turn on the TV, and shine a smartphone flashlight directly at a 45-degree angle against the panel glass from 2 inches away.
- **Observation**: If you can see faint images or menu text under the flashlight beam, the LCD panel is working, but the LED Backlight strips or LED driver power supply has failed.
- **Resolution**: Requires LED backlight strip array replacement by an authorized service engineer.

#### Scenario B: HDMI Signal Freeze
- Soft power cycle: Unplug TV and all connected HDMI cables for 60 seconds. Plug in TV first, then reconnect HDMI cables one by one.
    `,
  },
  {
    id: 'KB-108',
    title: 'Warranty Policy & Coverage Guidelines',
    category: 'Warranty',
    status: 'Published',
    lastUpdated: '01 Sep 2026',
    author: 'HomeCare Legal & Compliance',
    readingTime: '5 min',
    summary: 'Standard manufacturer warranty limits, component-specific warranties, and out-of-warranty inspection fee schedules across India.',
    tags: ['Warranty', 'Policy', 'Coverage', 'AMC', 'Invoice'],
    content: `
### Standard Warranty Framework
1. **Comprehensive Machine Warranty**: 1 Year from the date of tax invoice on all registered appliances.
2. **Dedicated Component Warranties**:
   - **AC Compressors**: 5 or 10 Years depending on brand inverter status.
   - **Washing Machine Inverter Motors**: 10 Years.
   - **Refrigerator Inverter Compressors**: 10 Years.
   - **Television Panels**: 1 Year standard; 2 Years for select OLED models.
   - **Water Purifier Electricals**: 1 Year (consumable filters excluded after 30 days).

### Valid Proof of Purchase
Valid GST tax invoice from an authorized distributor or registered e-commerce platform with matching serial number.

### Out of Warranty Rates
Standard technician inspection charge is ₹350 + GST across metro cities.
    `,
  },
  {
    id: 'KB-109',
    title: 'Installation Guidelines — Air Conditioners',
    category: 'Installation',
    status: 'Published',
    lastUpdated: '05 Sep 2026',
    author: 'HomeCare Field Support',
    readingTime: '4 min',
    summary: 'Standard operating procedures for copper piping length, vacuuming, wall bracket anchoring, and electrical MCB specifications.',
    tags: ['Installation', 'AC', 'Piping', 'Vacuum', 'Electrical'],
    content: `
### Key Standards
1. **Copper Piping Minimum Length**: Minimum 3.0 meters of insulated copper tubing between indoor and outdoor unit to avoid refrigerant resonance pulsation noise.
2. **Vacuuming Requirement**: Compulsory vacuum pump operation down to 500 microns (minimum 15 minutes) before releasing refrigerant valve to purge moisture and non-condensable atmospheric air.
3. **Electrical MCB Requirement**: Dedicated C-curve 16 Amp MCB for 1.5 Ton units; 20 Amp MCB for 2.0 Ton units. Do not run on domestic 3-pin plug sockets.
    `,
  },
  {
    id: 'KB-110',
    title: 'Washing Machine — Installation & Transit Bolt Protocol',
    category: 'Installation',
    status: 'Published',
    lastUpdated: '04 Sep 2026',
    author: 'HomeCare Field Support',
    readingTime: '3 min',
    summary: 'Safety protocol for unboxing, transit shipping bolt extraction, water inlet pressure checks, and vibration damping pads.',
    tags: ['Installation', 'Washing Machine', 'Transit Bolts', 'Plumbing'],
    content: `
### Critical Installation Checks
1. **Transit Bolt Removal**: All 4 rear shipping bolts MUST be unscrewed using the provided spanner and replaced with the plastic hole caps. Retain bolts in customer kit for future home relocation.
2. **Water Pressure**: Minimum dynamic water pressure of 0.5 bar (50 kPa) to maximum 8 bar. In high-rise towers, verify pressure reducing valves if water hammer occurs.
3. **Drain Hose Height**: In front loaders, the drain hose must loop up to at least 60 cm (24 inches) from floor level before draining into the waste pipe to prevent siphoning.
    `,
  },
  {
    id: 'KB-111',
    title: 'Water Purifier — High TDS Input Troubleshooting',
    category: 'Troubleshooting',
    status: 'Published',
    lastUpdated: '09 Sep 2026',
    author: 'HomeCare Water Solutions',
    readingTime: '3 min',
    summary: 'Guidelines for managing source borewell water TDS exceeding 1500 ppm and setting TDS mineral controllers.',
    tags: ['Water Purifier', 'TDS', 'Borewell', 'Membrane'],
    content: `
### Input Water Quality Criteria
- **Municipal Supply (TDS < 300 ppm)**: Standard RO+UV configuration. Mineral controller tuned to output 80–120 ppm.
- **Borewell Supply (TDS 1000–2000 ppm)**: High recovery RO membrane with anti-scalant cartridge.
- **TDS > 2000 ppm**: Commercial pre-softener required before domestic RO inlet to avoid membrane scaling within 3 months.
    `,
  },
  {
    id: 'KB-112',
    title: 'AC — Strange Odors & Chemical Smells Diagnosis',
    category: 'Air Conditioner',
    status: 'Published',
    lastUpdated: '13 Sep 2026',
    author: 'HomeCare Technical Operations',
    readingTime: '3 min',
    summary: 'Identifying mildew odors, plastic burning odors, and vinegar/chemical smells from evaporator louvers.',
    tags: ['AC', 'Odor', 'Smell', 'Maintenance'],
    content: `
### Odor Matrix
- **Sour / Musty Smell**: Mold and bacteria growth on the wet evaporator coil and condensate drain tray. Solution: Foam coil wash and UV coil sanitization.
- **Sweet / Ether Smell**: Refrigerant gas leak mixed with compressor oil mist. Immediate service required.
- **Burning Rubber / Plastic**: Motor winding overheat or melted electrical terminal. Immediate power cutoff required.
    `,
  },
  {
    id: 'KB-113',
    title: 'Television — Smart TV Wi-Fi Connection Recovery',
    category: 'Television',
    status: 'Published',
    lastUpdated: '07 Sep 2026',
    author: 'HomeCare Consumer Electronics',
    readingTime: '3 min',
    summary: 'Resolving DNS failures, SSL certificate handshake errors, and dual-band 2.4/5GHz Wi-Fi drops on Google TV, Tizen, and webOS.',
    tags: ['Television', 'Wi-Fi', 'Smart TV', 'Network'],
    content: `
### Troubleshooting Protocol
1. **Network Time Sync**: If apps fail with SSL error, manually set TV Date & Time to current time or toggle NTP sync.
2. **DNS Manual Configuration**: Switch IP settings from DHCP to Static. Set Primary DNS to 8.8.8.8 and Secondary DNS to 8.8.4.4.
3. **Router Band Separation**: Many TV wireless chips experience dropouts on single unified SSID mesh networks. Separate 2.4GHz and 5GHz SSIDs on home router.
    `,
  },
  {
    id: 'KB-114',
    title: 'Refrigerator — Strange Noises & Acoustic Guide',
    category: 'Refrigerator',
    status: 'Published',
    lastUpdated: '02 Sep 2026',
    author: 'HomeCare Cooling Division',
    readingTime: '3 min',
    summary: 'Differentiating normal refrigerant bubbling and thermal expansion popping from fan scraping or compressor knock.',
    tags: ['Refrigerator', 'Noise', 'Compressor', 'Acoustic'],
    content: `
### Normal Operating Sounds
- **Gurgling / Bubbling**: Normal sound of liquid refrigerant flowing through expansion tubes.
- **Cracking / Popping**: Thermal expansion and contraction of internal plastic liners during automatic defrost heater activation.

### Abnormal Sounds
- **Rhythmic Clicking / Buzzing with No Cooling**: PTC starter relay tripping on overload.
- **High-pitched Screeching**: Evaporator fan blade touching frost buildup in freezer.
    `,
  },
  {
    id: 'KB-115',
    title: 'Customer Escalation & Safety Advisory Guidelines',
    category: 'Troubleshooting',
    status: 'Published',
    lastUpdated: '16 Sep 2026',
    author: 'HomeCare Executive Leadership',
    readingTime: '4 min',
    summary: 'Mandatory AI agent escalation protocol for water leakage, electrical fire risk, repeated visits, and high customer distress.',
    tags: ['Safety', 'Escalation', 'Rules', 'Compliance'],
    content: `
### Critical Escalation Triggers
The HomeCare AI Agent is programmed to transfer calls immediately to a Human Senior Specialist under the following circumstances:
1. **Fire or Smoke Risk**: Customer reports sparks, electrical burning smells, or scorch marks.
2. **Flooding / Property Damage**: Water gushing from AC or washing machine onto floors or electrical sockets.
3. **Repeat Failure**: Appliance broken down again within 14 days of an authorized technician visit.
4. **Distress / Frustration Score**: Customer demands human agent or displays elevated frustration sentiment.
    `,
  },
  {
    id: 'KB-116',
    title: 'Water Purifier — Low Water Dispense Pressure Solutions',
    category: 'Water Purifier',
    status: 'Published',
    lastUpdated: '06 Sep 2026',
    author: 'HomeCare Water Solutions',
    readingTime: '3 min',
    summary: 'Diagnosing low municipal input pressure, booster pump failure, and clogged sediment cartridges.',
    tags: ['Water Purifier', 'Booster Pump', 'Pressure', 'Plumbing'],
    content: `
### Operating Principles
Domestic RO systems require minimum 0.3 kg/cm² inlet pressure to activate the Low Pressure Switch (LPS).
If input pressure is insufficient, the internal booster pump will not engage to protect itself from running dry.
Verify if the kitchen sink tap has normal overhead tank flow before troubleshooting internal filters.
    `,
  },
];

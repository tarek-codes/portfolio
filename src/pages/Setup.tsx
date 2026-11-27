import {useState} from 'react';
import type {ComponentType, SVGProps} from 'react';
import {VStack} from '@astryxdesign/core/VStack';
import {Text} from '@astryxdesign/core/Text';
import {Icon} from '@astryxdesign/core/Icon';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {
  CpuChipIcon, CircleStackIcon, ServerStackIcon, Squares2X2Icon, RectangleGroupIcon, ArrowPathIcon, ComputerDesktopIcon, CubeIcon,
  WrenchScrewdriverIcon, Bars3BottomLeftIcon, DevicePhoneMobileIcon, CommandLineIcon,
} from '@heroicons/react/24/outline';
import {setup} from '../content';
import {Section} from '../ui';
import {InterestShell} from './shell';

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

/** An icon per kind of part; anything else gets a plain cube. */
const ICONS: Record<string, IconType> = {
  case: Squares2X2Icon,
  cpu: CpuChipIcon,
  gpu: RectangleGroupIcon,
  ram: Bars3BottomLeftIcon,
  motherboard: ServerStackIcon,
  storage: CircleStackIcon,
  'cpu cooler': ArrowPathIcon,
  'operating system': ComputerDesktopIcon,
  phone: DevicePhoneMobileIcon,
  'secondary phone': DevicePhoneMobileIcon,
  laptop: CommandLineIcon,
};

const TABS: {value: string; label: string; icon: IconType}[] = [
  {value: 'PC Components', label: 'PC', icon: CpuChipIcon},
  {value: 'Laptop', label: 'Laptop', icon: CommandLineIcon},
  {value: 'Phones', label: 'Phones', icon: DevicePhoneMobileIcon},
];

export default function SetupPage() {
  const [tab, setTab] = useState(TABS[0].value);
  const parts = setup.filter((p) => (p.group ?? 'PC Components') === tab);
  return (
    <InterestShell title="My Setup" intro="The PC I code, build and play on, plus the laptop and phones I carry. Pick one below.">
      <Section id="devices" title="My Devices" icon={WrenchScrewdriverIcon}>
        <VStack gap={5}>
          <TabList value={tab} onChange={setTab} role="tablist" hasDivider>
            {TABS.map((t) => (
              <Tab key={t.value} value={t.value} label={t.label} panelId="setup-panel" icon={<Icon icon={t.icon} size="sm" color="inherit" />} />
            ))}
          </TabList>
          <div
            key={tab}
            id="setup-panel"
            role="tabpanel"
            className="tab-panel"
            style={{display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))'}}>
            {parts.map((p) => (
              <div key={p.part + p.name} style={{border: '1px solid rgba(128,128,128,0.35)', borderRadius: 12, padding: 20}}>
                <VStack gap={3}>
                  {p.image && (
                    <img
                      src={p.image}
                      alt={p.imageAlt ?? p.name}
                      loading="lazy"
                      style={{width: '100%', aspectRatio: '4 / 3', objectFit: 'contain', borderRadius: 8, background: '#ffffff', border: '1px solid rgba(128,128,128,0.2)', display: 'block'}}
                    />
                  )}
                  <HStackLabel part={p.part} />
                  <VStack gap={0.5}>
                    <Text type="large" weight="semibold">{p.name}</Text>
                    {p.detail && <Text color="secondary">{p.detail}</Text>}
                  </VStack>
                </VStack>
              </div>
            ))}
          </div>
        </VStack>
      </Section>
    </InterestShell>
  );
}

function HStackLabel({part}: {part: string}) {
  const icon = ICONS[part.toLowerCase()] ?? CubeIcon;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
      <Icon icon={icon} size="md" color="secondary" />
      <Text color="secondary" size="sm" weight="semibold">{part}</Text>
    </div>
  );
}

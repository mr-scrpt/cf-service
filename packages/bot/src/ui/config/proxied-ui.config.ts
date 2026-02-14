export interface ProxiedOption {
  value: boolean;
  label: string;
  emoji: string;
}

export const PROXIED_OPTIONS: ProxiedOption[] = [
  { value: true, label: 'Proxied', emoji: '☁️' },
  { value: false, label: 'DNS Only', emoji: '🌐' },
];

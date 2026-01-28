import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { useNetwork, Network } from '../contexts/NetworkContext';

export function NetworkSwitcher() {
  const { network, setNetwork } = useNetwork();

  return (
    <ToggleGroup
      type="single"
      value={network}
      onValueChange={(value) => {
        if (value && (value === 'mainnet' || value === 'calibration')) {
          setNetwork(value as Network);
        }
      }}
      variant="outline"
      size="default"
      className="shadow-md"
    >
      <ToggleGroupItem
        value="mainnet"
        aria-label="Mainnet"
        className="data-[state=on]:bg-white data-[state=on]:text-foreground data-[state=off]:bg-muted data-[state=off]:text-muted-foreground"
      >
        Mainnet
      </ToggleGroupItem>
      <ToggleGroupItem
        value="calibration"
        aria-label="Calibration"
        className="data-[state=on]:bg-white data-[state=on]:text-foreground data-[state=off]:bg-muted data-[state=off]:text-muted-foreground"
      >
        Calibration
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

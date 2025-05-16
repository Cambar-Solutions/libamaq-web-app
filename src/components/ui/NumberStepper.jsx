// components/ui/NumberStepper.jsx
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NumberStepper({
  value,
  onChange,
  min = 0,
  max = Infinity,
  step = 1,
}) {
  const decrement = () => onChange(Math.max(min, value - step));
  const increment = () => onChange(Math.min(max, value + step));

  const handleInput = (e) => {
    const n = parseInt(e.target.value, 10);
    if (!isNaN(n)) {
      onChange(Math.max(min, Math.min(max, n)));
    }
  };

  return (
    <div className="inline-flex items-center space-x-2 rounded-2xl border-2 border-blue-900 px-3 py-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={decrement}
        disabled={value <= min}
        className="p-1"
      >
        <Minus size={16} />
      </Button>
      <Input
        type="number"
        value={value}
        onChange={handleInput}
        className="w-12 p-0 text-center focus:outline-none"
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={increment}
        disabled={value >= max}
        className="p-1"
      >
        <Plus size={16} />
      </Button>
    </div>
  );
}

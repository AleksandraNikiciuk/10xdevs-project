interface CharacterCounterProps {
  count: number;
  max: number;
  className?: string;
}

export function CharacterCounter({ count, max, className = "" }: CharacterCounterProps) {
  return (
    <span className={className}>
      {count} / {max}
    </span>
  );
}

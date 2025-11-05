interface CharacterCounterProps {
  count: number;
  max: number;
  className?: string;
  dataTestId?: string;
}

export function CharacterCounter({ count, max, className = "", dataTestId }: CharacterCounterProps) {
  return (
    <span className={className} data-test-id={dataTestId}>
      {count} / {max}
    </span>
  );
}

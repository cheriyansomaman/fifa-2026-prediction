import { FLAG_CODES, FLAGS } from '../data/constants';

interface FlagImgProps {
  name: string;
  size?: number;
}

export function FlagImg({ name, size = 28 }: FlagImgProps) {
  const code = FLAG_CODES[name];

  if (!code) {
    return (
      <span
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.75,
          flexShrink: 0,
        }}
      >
        {FLAGS[name] ?? '⚽'}
      </span>
    );
  }

  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      alt={name}
      style={{
        width: size,
        height: size,
        objectFit: 'cover',
        borderRadius: '4px',
        display: 'block',
        flexShrink: 0,
      }}
    />
  );
}

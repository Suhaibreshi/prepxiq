export default function Logo({ className = "h-16 sm:h-24", invert = false }) {
  return (
    <img
      src="/3.png"
      alt="PREPX IQ"
      className={`${className} ${invert ? 'brightness-0 invert' : ''}`}
    />
  );
}

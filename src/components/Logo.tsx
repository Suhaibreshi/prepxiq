export default function Logo({ className = "h-12 sm:h-16", invert = false }) {
  return (
    <img
      src="/3.png"
      alt="PREPX IQ"
      className={`${className} ${invert ? 'brightness-0 invert' : ''}`}
    />
  );
}

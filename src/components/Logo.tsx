export default function Logo({ className = "h-8 sm:h-10", invert = false }) {
  return (
    <img
      src="/3.png"
      alt="PREPX IQ"
      className={`${className} ${invert ? 'brightness-0 invert' : ''}`}
    />
  );
}

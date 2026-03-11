export default function Logo({ className = "h-8 sm:h-12", invert = false }) {
  return (
    <img
      src="/header-logo.png"
      alt="PREPX IQ"
      className={`object-contain w-auto ${className} ${invert ? 'brightness-0 invert' : ''}`}
    />
  );
}

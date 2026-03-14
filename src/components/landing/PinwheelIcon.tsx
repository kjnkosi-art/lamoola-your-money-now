const PinwheelIcon = ({ size = 32, color = "#5F8B40", className = "" }: { size?: number; color?: string; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* 6 petal segments arranged radially with gaps */}
    {[0, 60, 120, 180, 240, 300].map((angle) => (
      <path
        key={angle}
        d="M50 50 L50 12 A38 38 0 0 1 82.9 31 Z"
        fill={color}
        transform={`rotate(${angle} 50 50)`}
      />
    ))}
    {/* Centre circle */}
    <circle cx="50" cy="50" r="6" fill={color} />
  </svg>
);

export default PinwheelIcon;

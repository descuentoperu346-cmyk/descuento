import React from 'react';

interface LogoProps {
  className?: string;
  size?: number | string;
}

// ============================================================================
// 1. PAYMENT METHOD LOGOS (REAL OFFICIAL APPS & PERUVIAN WALLETS)
// ============================================================================

/**
 * Official Yape Logo (Peruvian BCP Digital Wallet)
 * Signature Purple (#742284) with Mint Green (#00D494) & White
 */
export const YapeLogo: React.FC<LogoProps> = ({ className = '', size = 28 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 rounded-xl overflow-hidden ${className}`}
    >
      <rect width="100" height="100" rx="22" fill="#742284" />
      {/* Characteristic Yape stylized geometric symbol */}
      <circle cx="28" cy="28" r="8" fill="#00D494" />
      <circle cx="72" cy="28" r="8" fill="#00D494" />
      <path
        d="M28 42C28 42 40 46 50 62C60 46 72 42 72 42"
        stroke="#00D494"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M50 62V84"
        stroke="#FFFFFF"
        strokeWidth="10"
        strokeLinecap="round"
      />
    </svg>
  );
};

/**
 * Official Plin Logo (Peruvian Interbank/BBVA/Scotiabank Wallet)
 * Signature Cyan/Teal (#00D1D5) with bold typography & fluid dots
 */
export const PlinLogo: React.FC<LogoProps> = ({ className = '', size = 28 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 rounded-xl overflow-hidden ${className}`}
    >
      <rect width="100" height="100" rx="22" fill="#00D1D5" />
      {/* Plin fluid overlapping bubbles & 'plin' lettering */}
      <circle cx="34" cy="30" r="10" fill="#FFFFFF" />
      <circle cx="66" cy="30" r="10" fill="#003554" />
      <path
        d="M26 44H34V76H26V44ZM44 44H52V76H44V44ZM62 44H70V76H62V44Z"
        fill="#FFFFFF"
      />
      <path
        d="M26 44C26 44 38 42 42 54C46 66 38 76 26 76"
        fill="#FFFFFF"
        fillOpacity="0.95"
      />
    </svg>
  );
};

/**
 * Official BCP Logo (Banco de Crédito del Perú)
 * Signature Navy Blue (#002A8F) with Iconic Orange Chevron (#FF7800)
 */
export const BcpLogo: React.FC<LogoProps> = ({ className = '', size = 28 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 rounded-xl overflow-hidden ${className}`}
    >
      <rect width="100" height="100" rx="22" fill="#002A8F" />
      {/* BCP Bold Wordmark */}
      <text
        x="12"
        y="60"
        fill="#FFFFFF"
        fontSize="34"
        fontWeight="900"
        fontFamily="Arial, Helvetica, sans-serif"
        letterSpacing="-1.5"
      >
        BCP
      </text>
      {/* Orange Iconic Chevron Ribbon */}
      <path
        d="M74 38L86 52L74 66"
        stroke="#FF7800"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * Official Interbank Logo
 * Signature Green (#009A44) with 'IB' Monogram & Blue Square
 */
export const InterbankLogo: React.FC<LogoProps> = ({ className = '', size = 28 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 rounded-xl overflow-hidden ${className}`}
    >
      <rect width="100" height="100" rx="22" fill="#009A44" />
      {/* Interbank Navy Dot */}
      <rect x="25" y="22" width="14" height="14" rx="3" fill="#002B49" />
      {/* Interbank 'IB' Monogram */}
      <path
        d="M25 42H39V78H25V42ZM47 22H61C70 22 76 27 76 34C76 40 71 44 65 46C72 48 78 53 78 61C78 71 70 78 60 78H47V22ZM60 35H57V46H60C64 46 66 43 66 40C66 37 64 35 60 35ZM60 54H57V66H61C65 66 68 64 68 60C68 56 65 54 61 54H60Z"
        fill="#FFFFFF"
      />
    </svg>
  );
};

/**
 * Official Binance Pay Logo
 * Signature Dark Slate Background with Binance Gold (#F0B90B) Diamonds
 */
export const BinanceLogo: React.FC<LogoProps> = ({ className = '', size = 28 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 rounded-xl overflow-hidden ${className}`}
    >
      <rect width="100" height="100" rx="22" fill="#181A20" />
      {/* Interlocking Binance Gold Diamonds */}
      <g fill="#F0B90B">
        <path d="M50 20L63.5 33.5L50 47L36.5 33.5L50 20Z" />
        <path d="M26 43.5L35 52.5L26 61.5L17 52.5L26 43.5Z" />
        <path d="M74 43.5L83 52.5L74 61.5L65 52.5L74 43.5Z" />
        <path d="M50 58L59 67L50 76L41 67L50 58Z" />
        <path d="M50 37.5L59.5 47L50 56.5L40.5 47L50 37.5Z" fill="#181A20" />
      </g>
    </svg>
  );
};

/**
 * Official Tether USDT Logo
 * Signature Emerald Green (#26A17B) with White '₮'
 */
export const UsdtLogo: React.FC<LogoProps> = ({ className = '', size = 28 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 rounded-xl overflow-hidden ${className}`}
    >
      <rect width="100" height="100" rx="22" fill="#26A17B" />
      {/* Tether Crossbar & Ring */}
      <path
        d="M24 34H76V44H55V50.5C69 51.5 78 55 78 59C78 63 69 66.5 55 67.5V78H45V67.5C31 66.5 22 63 22 59C22 55 31 51.5 45 50.5V44H24V34ZM50 55C37 55 31 57.5 31 59C31 60.5 37 63 50 63C63 63 69 60.5 69 59C69 57.5 63 55 50 55Z"
        fill="#FFFFFF"
      />
    </svg>
  );
};

/**
 * Official BBVA Logo
 * Signature Navy Blue (#004481) with Bold White Typography
 */
export const BbvaLogo: React.FC<LogoProps> = ({ className = '', size = 28 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 rounded-xl overflow-hidden ${className}`}
    >
      <rect width="100" height="100" rx="22" fill="#004481" />
      <text
        x="50"
        y="58"
        fill="#FFFFFF"
        fontSize="24"
        fontWeight="900"
        fontFamily="Arial, Helvetica, sans-serif"
        textAnchor="middle"
        letterSpacing="1"
      >
        BBVA
      </text>
    </svg>
  );
};

// ============================================================================
// 2. OFFICIAL APP & SERVICE BRAND LOGOS
// ============================================================================

/**
 * Official Netflix Red Ribbon "N" Logo
 */
export const NetflixLogo: React.FC<LogoProps> = ({ className = '', size = 28 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 rounded-xl overflow-hidden ${className}`}
    >
      <rect width="100" height="100" rx="22" fill="#000000" />
      {/* Netflix N Ribbons */}
      <path d="M30 18H44V82H30V18Z" fill="#B81D24" />
      <path d="M56 18H70V82H56V18Z" fill="#B81D24" />
      <path d="M30 18L70 82H56L30 24V18Z" fill="#E50914" />
    </svg>
  );
};

/**
 * Official Spotify Green Logo
 */
export const SpotifyLogo: React.FC<LogoProps> = ({ className = '', size = 28 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 rounded-xl overflow-hidden ${className}`}
    >
      <circle cx="50" cy="50" r="50" fill="#1ED760" />
      <g fill="#000000">
        {/* Spotify 3 Audio Waves */}
        <path d="M22 39C38 34 65 35 80 43C82 44 83 47 81 50C80 52 77 53 74 51C62 44 38 42 24 47C22 48 19 46 18 43C17 40 19 38 22 39Z" />
        <path d="M26 53C39 49 61 50 74 58C76 59 77 62 75 64C74 66 71 67 69 65C58 58 39 57 28 61C26 62 23 60 22 58C21 55 23 52 26 53Z" />
        <path d="M29 67C40 64 57 65 68 71C70 72 71 75 69 77C68 79 65 80 63 78C54 73 40 72 30 75C28 76 25 74 24 72C23 70 25 67 29 67Z" />
      </g>
    </svg>
  );
};

/**
 * Official Disney+ Logo
 */
export const DisneyPlusLogo: React.FC<LogoProps> = ({ className = '', size = 28 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 rounded-xl overflow-hidden ${className}`}
    >
      <rect width="100" height="100" rx="22" fill="#040714" />
      {/* Disney Arc */}
      <path
        d="M20 62C30 36 60 26 84 40"
        stroke="#22D3EE"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Plus Symbol */}
      <path
        d="M74 48V68M64 58H84"
        stroke="#FFFFFF"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <text
        x="32"
        y="62"
        fill="#FFFFFF"
        fontSize="34"
        fontStyle="italic"
        fontWeight="900"
        fontFamily="Georgia, serif"
      >
        D
      </text>
    </svg>
  );
};

/**
 * Official ChatGPT / OpenAI Hexagonal Rosette Logo
 */
export const ChatGptLogo: React.FC<LogoProps> = ({ className = '', size = 28 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 rounded-xl overflow-hidden ${className}`}
    >
      <rect width="100" height="100" rx="22" fill="#10A37F" />
      {/* OpenAI Swirl */}
      <g stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M50 24V40L64 48" />
        <path d="M72 37L58 45L58 61" />
        <path d="M72 63L58 55L44 63" />
        <path d="M50 76V60L36 52" />
        <path d="M28 63L42 55L42 39" />
        <path d="M28 37L42 45L56 37" />
      </g>
    </svg>
  );
};

/**
 * Official Canva Pro Gradient Logo
 */
export const CanvaLogo: React.FC<LogoProps> = ({ className = '', size = 28 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 rounded-xl overflow-hidden ${className}`}
    >
      <defs>
        <linearGradient id="canvaGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00C4CC" />
          <stop offset="50%" stopColor="#7D2AE8" />
          <stop offset="100%" stopColor="#FF007A" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(#canvaGrad)" />
      <text
        x="52"
        y="65"
        fill="#FFFFFF"
        fontSize="54"
        fontFamily="'Brush Script MT', cursive, sans-serif"
        textAnchor="middle"
      >
        C
      </text>
    </svg>
  );
};

/**
 * Official Microsoft Windows 11 Logo
 */
export const WindowsLogo: React.FC<LogoProps> = ({ className = '', size = 28 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 rounded-xl overflow-hidden ${className}`}
    >
      <rect width="100" height="100" rx="22" fill="#030914" />
      {/* 4 Windows Blue Squares */}
      <rect x="22" y="22" width="24" height="24" rx="3" fill="#0078D4" />
      <rect x="54" y="22" width="24" height="24" rx="3" fill="#0078D4" />
      <rect x="22" y="54" width="24" height="24" rx="3" fill="#0078D4" />
      <rect x="54" y="54" width="24" height="24" rx="3" fill="#0078D4" />
    </svg>
  );
};

/**
 * Official Cyber Intelligence / OSINT Shield Radar Badge
 */
export const OsintLogo: React.FC<LogoProps> = ({ className = '', size = 28 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 rounded-xl overflow-hidden ${className}`}
    >
      <rect width="100" height="100" rx="22" fill="#05190e" />
      <circle cx="50" cy="50" r="30" stroke="#00ff88" strokeWidth="2.5" strokeOpacity="0.8" strokeDasharray="4 4" />
      <circle cx="50" cy="50" r="16" stroke="#00ff88" strokeWidth="2" strokeOpacity="0.5" />
      <circle cx="50" cy="50" r="5" fill="#00ff88" />
      <path d="M50 14V30M50 70V86M14 50H30M70 50H86" stroke="#00ff88" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
};

// ============================================================================
// 3. UNIVERSAL LOGO RESOLVERS
// ============================================================================

/**
 * Resolves a payment method ID or Name to its official brand vector SVG logo.
 */
export const PaymentBrandLogo: React.FC<{
  methodId?: string;
  methodName?: string;
  size?: number | string;
  className?: string;
}> = ({ methodId = '', methodName = '', size = 28, className = '' }) => {
  const query = `${methodId} ${methodName}`.toLowerCase();

  if (query.includes('yape')) {
    return <YapeLogo size={size} className={className} />;
  }
  if (query.includes('plin')) {
    return <PlinLogo size={size} className={className} />;
  }
  if (query.includes('bcp') || query.includes('crédito') || query.includes('credito')) {
    return <BcpLogo size={size} className={className} />;
  }
  if (query.includes('interbank')) {
    return <InterbankLogo size={size} className={className} />;
  }
  if (query.includes('binance') || query.includes('usdt') || query.includes('crypto')) {
    return (
      <div className="flex items-center -space-x-2">
        <BinanceLogo size={size} className={className} />
        <UsdtLogo size={Number(size) * 0.85} className="border-2 border-[#030d07]" />
      </div>
    );
  }
  if (query.includes('bbva')) {
    return <BbvaLogo size={size} className={className} />;
  }

  // Fallback
  return <BcpLogo size={size} className={className} />;
};

/**
 * Resolves a service / product ID or Title to its official brand vector SVG logo.
 */
export const ServiceAppLogo: React.FC<{
  serviceId?: string;
  serviceTitle?: string;
  size?: number | string;
  className?: string;
}> = ({ serviceId = '', serviceTitle = '', size = 24, className = '' }) => {
  const query = `${serviceId} ${serviceTitle}`.toLowerCase();

  if (query.includes('netflix')) {
    return <NetflixLogo size={size} className={className} />;
  }
  if (query.includes('spotify')) {
    return <SpotifyLogo size={size} className={className} />;
  }
  if (query.includes('disney')) {
    return <DisneyPlusLogo size={size} className={className} />;
  }
  if (query.includes('chatgpt') || query.includes('openai') || query.includes('gpt')) {
    return <ChatGptLogo size={size} className={className} />;
  }
  if (query.includes('canva')) {
    return <CanvaLogo size={size} className={className} />;
  }
  if (query.includes('windows') || query.includes('office') || query.includes('microsoft')) {
    return <WindowsLogo size={size} className={className} />;
  }
  if (query.includes('osint') || query.includes('investigacion') || query.includes('leaks')) {
    return <OsintLogo size={size} className={className} />;
  }

  return null;
};

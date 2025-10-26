import { motion } from 'framer-motion';
// you found this singing monster! 🐲🎤 EASTER EGGG
interface SingingMonsterProps {
  color: 'green' | 'blue' | 'orange' | 'yellow' | 'teal';
  size?: 'small' | 'medium' | 'large';
  isSinging?: boolean;
  delay?: number;
}

export default function SingingMonster({ 
  color, 
  size = 'medium', 
  isSinging = true,
  delay = 0 
}: SingingMonsterProps) {
  const colorMap = {
    green: {
      body: '#7FB069',
      bodyDark: '#6A9556',
      bodyLight: '#94C47D',
      eye: '#F4D06F',
      eyeDark: '#2d2d2d',
      mouth: '#2d2d2d',
      tongue: '#E07A5F',
    },
    blue: {
      body: '#5EAAA8',
      bodyDark: '#4D8F8D',
      bodyLight: '#7BC5C3',
      eye: '#F4D06F',
      eyeDark: '#2d2d2d',
      mouth: '#2d2d2d',
      tongue: '#E07A5F',
    },
    orange: {
      body: '#E07A5F',
      bodyDark: '#C86A51',
      bodyLight: '#EA9479',
      eye: '#F4D06F',
      eyeDark: '#2d2d2d',
      mouth: '#2d2d2d',
      tongue: '#E07A5F',
    },
    yellow: {
      body: '#F4D06F',
      bodyDark: '#E0BE5C',
      bodyLight: '#F7DD89',
      eye: '#E07A5F',
      eyeDark: '#2d2d2d',
      mouth: '#2d2d2d',
      tongue: '#E07A5F',
    },
    teal: {
      body: '#81C3D7',
      bodyDark: '#6AAFBF',
      bodyLight: '#9CD3E4',
      eye: '#F4D06F',
      eyeDark: '#2d2d2d',
      mouth: '#2d2d2d',
      tongue: '#E07A5F',
    },
  };

  const sizeMap = {
    small: { width: 80, height: 100 },
    medium: { width: 120, height: 150 },
    large: { width: 160, height: 200 },
  };

  const colors = colorMap[color];
  const dimensions = sizeMap[size];

  return (
    <motion.div
      animate={{
        y: isSinging ? [0, -8, 0] : 0,
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
      style={{ width: dimensions.width, height: dimensions.height }}
      className="relative"
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 120 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Body */}
        <ellipse
          cx="60"
          cy="90"
          rx="40"
          ry="50"
          fill={colors.body}
          stroke="#2d2d2d"
          strokeWidth="3"
        />
        
        {/* Body texture spots */}
        <ellipse cx="45" cy="75" rx="8" ry="10" fill={colors.bodyDark} opacity="0.3" />
        <ellipse cx="70" cy="95" rx="6" ry="8" fill={colors.bodyDark} opacity="0.3" />
        <ellipse cx="55" cy="110" rx="7" ry="9" fill={colors.bodyDark} opacity="0.3" />

        {/* Left Eye */}
        <motion.g
          animate={{
            scaleY: isSinging ? [1, 0.1, 1] : 1,
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: delay + 2,
          }}
        >
          <ellipse
            cx="45"
            cy="65"
            rx="12"
            ry="14"
            fill="white"
            stroke="#2d2d2d"
            strokeWidth="3"
          />
          <ellipse cx="47" cy="67" rx="6" ry="8" fill={colors.eyeDark} />
          <circle cx="48" cy="65" r="3" fill="white" />
        </motion.g>

        {/* Right Eye */}
        <motion.g
          animate={{
            scaleY: isSinging ? [1, 0.1, 1] : 1,
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: delay + 2,
          }}
        >
          <ellipse
            cx="75"
            cy="65"
            rx="12"
            ry="14"
            fill="white"
            stroke="#2d2d2d"
            strokeWidth="3"
          />
          <ellipse cx="77" cy="67" rx="6" ry="8" fill={colors.eyeDark} />
          <circle cx="78" cy="65" r="3" fill="white" />
        </motion.g>

        {/* Mouth - singing */}
        {isSinging ? (
          <motion.g
            animate={{
              scaleY: [1, 1.15, 0.95, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay,
            }}
          >
            <ellipse
              cx="60"
              cy="95"
              rx="15"
              ry="18"
              fill={colors.mouth}
              stroke="#2d2d2d"
              strokeWidth="3"
            />
            <ellipse cx="60" cy="100" rx="10" ry="8" fill={colors.tongue} />
          </motion.g>
        ) : (
          <path
            d="M 45 95 Q 60 105 75 95"
            stroke="#2d2d2d"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        )}

        {/* Left Arm */}
        <motion.path
          d="M 25 95 Q 15 90 20 85"
          stroke="#2d2d2d"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          animate={{
            d: isSinging
              ? [
                  'M 25 95 Q 15 90 20 85',
                  'M 25 95 Q 12 88 18 82',
                  'M 25 95 Q 15 90 20 85',
                ]
              : 'M 25 95 Q 15 90 20 85',
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay,
          }}
        />

        {/* Right Arm */}
        <motion.path
          d="M 95 95 Q 105 90 100 85"
          stroke="#2d2d2d"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          animate={{
            d: isSinging
              ? [
                  'M 95 95 Q 105 90 100 85',
                  'M 95 95 Q 108 88 102 82',
                  'M 95 95 Q 105 90 100 85',
                ]
              : 'M 95 95 Q 105 90 100 85',
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: delay + 0.2,
          }}
        />

        {/* Left Foot */}
        <ellipse
          cx="45"
          cy="135"
          rx="12"
          ry="8"
          fill={colors.bodyDark}
          stroke="#2d2d2d"
          strokeWidth="3"
        />

        {/* Right Foot */}
        <ellipse
          cx="75"
          cy="135"
          rx="12"
          ry="8"
          fill={colors.bodyDark}
          stroke="#2d2d2d"
          strokeWidth="3"
        />

        {/* Hair/Antenna tufts */}
        <motion.g
          animate={{
            rotate: isSinging ? [0, -5, 5, 0] : 0,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: delay + 0.5,
          }}
          style={{ transformOrigin: '40px 40px' }}
        >
          <circle cx="40" cy="40" r="8" fill={colors.bodyLight} stroke="#2d2d2d" strokeWidth="3" />
        </motion.g>
        <motion.g
          animate={{
            rotate: isSinging ? [0, 5, -5, 0] : 0,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: delay + 0.7,
          }}
          style={{ transformOrigin: '60px 35px' }}
        >
          <circle cx="60" cy="35" r="6" fill={colors.bodyLight} stroke="#2d2d2d" strokeWidth="3" />
        </motion.g>
        <motion.g
          animate={{
            rotate: isSinging ? [0, -5, 5, 0] : 0,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: delay + 0.3,
          }}
          style={{ transformOrigin: '80px 40px' }}
        >
          <circle cx="80" cy="40" r="8" fill={colors.bodyLight} stroke="#2d2d2d" strokeWidth="3" />
        </motion.g>
      </svg>
    </motion.div>
  );
}

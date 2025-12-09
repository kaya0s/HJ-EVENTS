import { motion } from "framer-motion";

const ScrollReveal = ({
  children,
  animation = "fade", // fade, slideUp, slideLeft, slideRight, scale
  delay = 0,
  duration = 0.5,
  className = "",
  viewport = { once: true, margin: "-10%" },
  as = "div", // Default to div, but can be 'tr', 'li', etc.
}) => {
  const Component = motion[as] || motion.div;

  const animations = {
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    slideUp: {
      hidden: { opacity: 0, y: 50 },
      visible: { opacity: 1, y: 0 },
    },
    slideLeft: {
      hidden: { opacity: 0, x: 50 },
      visible: { opacity: 1, x: 0 },
    },
    slideRight: {
      hidden: { opacity: 0, x: -50 },
      visible: { opacity: 1, x: 0 },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 },
    },
  };

  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      transition={{ duration, delay, ease: "easeOut" }}
      variants={animations[animation] || animations.fade}
      className={className}
    >
      {children}
    </Component>
  );
};

export default ScrollReveal;

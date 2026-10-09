import Link from "next/link";
import {
  FaHeart,
  FaMoon,
  FaShieldAlt,
  FaBrain,
  FaSmileBeam,
  FaHandHoldingHeart,
  FaCalendarCheck,
  FaArrowRight,
} from "react-icons/fa";
import { GiStomach } from "react-icons/gi";
import styles from "./Benefits.module.css";

const benefits = [
  {
    icon: FaHeart,
    color: "honey",
    title: "Builds a stronger bond",
    text: "Creates special one-on-one time and deepens connection.",
  },
  {
    icon: FaMoon,
    color: "sage",
    title: "Promotes better sleep",
    text: "Helps your baby feel calm, relaxed and secure.",
  },
  {
    icon: GiStomach,
    color: "peach",
    title: "Supports digestion",
    text: "Can help with colic, gas and tummy discomfort.",
  },
  {
    icon: FaShieldAlt,
    color: "sky",
    title: "Boosts the immune system",
    text: "Encourages healthy circulation and lymph flow.",
  },
  {
    icon: FaBrain,
    color: "lilac",
    title: "Supports development",
    text: "Stimulates the nervous system, encourages muscle tone and improves body awareness.",
  },
  {
    icon: FaSmileBeam,
    color: "honey",
    title: "Reduces stress",
    text: "Helps release tension and regulates emotions.",
  },
  {
    icon: FaHandHoldingHeart,
    color: "sage",
    title: "Encourages physical growth",
    text: "Supports healthy movement, growth and coordination.",
  },
];

export const metadata = {
  title: "Benefits | BeeWell Infant Spa",
  description:
    "Discover the benefits of baby massage: bonding, better sleep, digestion support, development and more.",
};

export default function Benefits() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>
          <FaHeart aria-hidden="true" /> Gentle touch. Big benefits.
        </p>
        <h1 className={styles.title}>
          The <span className={styles.highlight}>benefits</span> of baby
          massage
        </h1>
        <p className={styles.motto}>
          <span>Bond</span>
          <i aria-hidden="true">•</i>
          <span>Relax</span>
          <i aria-hidden="true">•</i>
          <span>Grow</span>
        </p>
      </header>

      <ul className={styles.grid}>
        {benefits.map(({ icon: Icon, color, title, text }) => (
          <li key={title} className={`${styles.card} ${styles[color]}`}>
            <span className={styles.iconWrap}>
              <Icon aria-hidden="true" />
            </span>
            <h2 className={styles.cardTitle}>{title}</h2>
            <p className={styles.cardText}>{text}</p>
          </li>
        ))}
      </ul>

      <p className={styles.note}>
        Every baby is different, so benefits can vary from one little one to
        the next.
      </p>

      <section className={styles.cta}>
        <h2 className={styles.ctaTitle}>Ready to bond with your baby?</h2>
        <p className={styles.ctaText}>
          Join a small group of 5 parents for 5 weeks of calm, caring touch.
        </p>
        <div className={styles.actions}>
          <Link href="/book" className={styles.primary}>
            <FaCalendarCheck aria-hidden="true" />
            Book a class
          </Link>
          <Link href="/classes" className={styles.secondary}>
            How classes work
            <FaArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
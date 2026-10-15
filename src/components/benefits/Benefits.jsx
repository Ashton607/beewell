import Link from "next/link";
import {
  FaHeart,
  FaBrain,
  FaCalendarCheck,
  FaArrowRight,
  FaRunning,     
  FaShieldAlt,   
  FaSmileBeam    
} from "react-icons/fa";
import { GiStomach } from "react-icons/gi";
import styles from "./Benefits.module.css";

const benefits = [
  {
    icon: FaRunning, 
    color: "honey",
    title: "Enhanced Motor Skills",
    text: "Helps develop coordination and balance, encouraging physical milestones sooner.",
  },
  {
    icon: FaShieldAlt, 
    color: "sage",
    title: "Immune System Boost",
    text: "Promotes circulation, stimulating immune responses and reducing illness risk.",
  },
  {
    icon: FaHeart, 
    color: "peach",
    title: "Emotional Resilience Strength",
    text: "Builds confidence through secure touch, aiding emotional self-regulation.",
  },
  {
    icon: GiStomach, 
    color: "sky",
    title: "Pain Relief",
    text: "Can ease teething pain, abdominal discomfort and muscle discomfort naturally.",
  },
  {
    icon: FaBrain, 
    color: "lilac",
    title: "Sensory Processing",
    text: "Supports babies in understanding touch, sound, and visual cues.",
  },
  {
    icon: FaSmileBeam, 
    color: "honey",
    title: "Social Interaction Skills",
    text: "Encourages babies to engage with others, fostering social confidence.",
  },
];

export const metadata = {
  title: "Benefits | BeeWell Infant Spa",
  description:
    "Discover the benefits of baby massage: bonding, better sleep, digestion support, development and more.",
};

export default function Benefits() {
  return (
    <main className={styles.page} id="benefits">
      <header className={styles.header}>
        <p className={styles.eyebrow}>
          <FaHeart aria-hidden="true" /> A Path to Health, Happiness, and Connection.
        </p>
        <h1 className={styles.title}>
          The <span className={styles.highlight}>benefits</span> of baby
          massages
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
          <Link href="#classes" className={styles.secondary}>
            How classes work
            <FaArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
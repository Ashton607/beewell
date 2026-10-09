import Link from "next/link";
import { FaCalendarCheck, FaArrowRight, FaHeart, FaUsers } from "react-icons/fa";
import { GiSprout } from "react-icons/gi";
import styles from "./Hero.module.css";

// Replace this with your own image (put the file in /public/images/)
const HERO_IMAGE = "/hero/logo.jpeg";

export default function Hero() {
  return (
    <section
      className={styles.hero}
      style={{ "--hero-image": `url(${HERO_IMAGE})` }}
      id="home"
    >
      <div className={styles.overlay} />

      <div className={styles.content}>
        <p className={styles.tagline}>
          <FaHeart aria-hidden="true" /> Gentle touch. Big benefits.
        </p>

        <h1 className={styles.title}>
          Baby Massage <span className={styles.highlight}>Classes</span>
        </h1>

        <p className={styles.subtitle}>
          Designed for babies from 0 – 12 months. Bond, relax and grow in a
          calm, comfortable space with your little one.
        </p>

        <p className={styles.motto}>
          <span>Bond</span>
          <i aria-hidden="true">•</i>
          <span>Relax</span>
          <i aria-hidden="true">•</i>
          <span>Grow</span>
        </p>

        <div className={styles.actions}>
          <Link href="/book" className={styles.primary}>
            <FaCalendarCheck aria-hidden="true" />
            Book a class
          </Link>
          <Link href="#classes" className={styles.secondary}>
            See our services
            <FaArrowRight aria-hidden="true" />
          </Link>
        </div>

        <ul className={styles.facts}>
          <li>
            <FaCalendarCheck aria-hidden="true" /> 5 classes over 5 weeks
          </li>
          <li>
            <FaUsers aria-hidden="true" /> Small groups
          </li>
          <li>
            <GiSprout aria-hidden="true" /> R1000 for 5 classes
          </li>
        </ul>
      </div>
    </section>
  );
}
import Link from "next/link";
import {
  FaHeart,
  FaExternalLinkAlt,
  FaCertificate,
  FaBullseye,
  FaEye,
  FaGem,
  FaCheckCircle,
  FaAward,
  FaUsers,
  FaChalkboardTeacher,
  FaCalendarCheck,
} from "react-icons/fa";
import styles from "./About.module.css";

/* ---------- Edit these ---------- */
const INSTRUCTOR_NAME = "Penny";
const ABOUT_IMAGE = "/about/logo.jpeg"; // put your photo in /public/images/
const IAIM_URL = "https://iaimsa.co.za"; // replace with the real International Association of Infant Massage link

const values = [
  "Gentle, loving care",
  "Connection between parent and baby",
  "Safety and trust",
  "Individual attention in small groups",
  "A calm, welcoming community",
];

// Replace these placeholder numbers with your real figures
const stats = [
  { icon: FaAward, value: "5+", label: "Years of experience" },
  { icon: FaCertificate, value: "IAIM", label: "Certified instructor" },
  { icon: FaUsers, value: "100+", label: "Satisfied parents" },
  { icon: FaChalkboardTeacher, value: "50+", label: "Classes taught" },
];
/* -------------------------------- */

export const metadata = {
  title: "About | BeeWell Infant Spa",
  description:
    "Meet the certified infant massage instructor behind BeeWell Infant Spa.",
};

export default function AboutPage() {
  return (
    <main className={styles.page}>
      {/* Story */}
      <section className={styles.story}>
        <div className={styles.storyText}>
          <p className={styles.eyebrow}>
            <FaHeart aria-hidden="true" /> My story
          </p>
          <h1 className={styles.title}>
            Hi, I&apos;m{" "}
            <span className={styles.highlight}>{INSTRUCTOR_NAME}</span>
          </h1>

          <p>
            BeeWell Infant Spa began with a simple belief: that gentle,
            loving touch can make a big difference in the first year of a
            baby&apos;s life. I wanted to create a calm space where parents
            can slow down, connect with their little ones and feel confident
            in their own hands.
          </p>

          <p>
            To do this properly, I trained with the{" "}
            <a
              href={IAIM_URL}
              className={styles.storyLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              International Association of Infant Massage
              <FaExternalLinkAlt aria-hidden="true" />
            </a>
            , where I learned how to become a certified infant massage
            instructor. That training taught me not only the techniques, but
            how to guide parents with patience, care and respect for every
            baby&apos;s unique needs.
          </p>

          <p>
            Today I teach baby massage classes in Douglas and Kimberley, in
            small groups of 5 parents so everyone gets individual attention.
            Every class is about bonding, relaxing and growing together, and
            there is nothing I enjoy more than watching parents and babies
            settle into it.
          </p>
        </div>

        <div className={styles.imageWrap}>
          <div
            className={styles.image}
            style={{ "--about-image": `url(${ABOUT_IMAGE})` }}
            role="img"
            aria-label={`${INSTRUCTOR_NAME}, certified infant massage instructor`}
          />
          <div className={styles.badge}>
            <FaCertificate aria-hidden="true" />
            <span>Certified infant massage instructor</span>
          </div>
        </div>
      </section>

      {/* Mission, vision, values */}
      <section className={styles.mvv}>
        <article className={`${styles.mvvCard} ${styles.honey}`}>
          <span className={styles.mvvIcon}>
            <FaBullseye aria-hidden="true" />
          </span>
          <h2>Mission</h2>
          <p>
            To help parents bond with their babies through gentle, nurturing
            massage, in a calm and supportive space where every family feels
            welcome and confident.
          </p>
        </article>

        <article className={`${styles.mvvCard} ${styles.sky}`}>
          <span className={styles.mvvIcon}>
            <FaEye aria-hidden="true" />
          </span>
          <h2>Vision</h2>
          <p>
            A community where loving touch is part of every baby&apos;s first
            year, helping little ones sleep, relax and grow, and helping
            parents feel connected.
          </p>
        </article>

        <article className={`${styles.mvvCard} ${styles.sage}`}>
          <span className={styles.mvvIcon}>
            <FaGem aria-hidden="true" />
          </span>
          <h2>Values</h2>
          <ul className={styles.valueList}>
            {values.map((v) => (
              <li key={v}>
                <FaCheckCircle aria-hidden="true" /> {v}
              </li>
            ))}
          </ul>
        </article>
      </section>

      {/* Stats */}
      <section className={styles.stats} aria-label="BeeWell in numbers">
        {stats.map(({ icon: Icon, value, label }) => (
          <div key={label} className={styles.stat}>
            <span className={styles.statIcon}>
              <Icon aria-hidden="true" />
            </span>
            <p className={styles.statValue}>{value}</p>
            <p className={styles.statLabel}>{label}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <h2>Come and meet us</h2>
        <p>Join a small group and enjoy 5 weeks of calm, caring touch.</p>
        <Link href="/book" className={styles.ctaButton}>
          <FaCalendarCheck aria-hidden="true" />
          Book a class
        </Link>
      </section>
    </main>
  );
}
import Link from "next/link";
import {
  FaMapMarkerAlt,
  FaCalendarDay,
  FaClock,
  FaUsers,
  FaCalendarCheck,
  FaSyncAlt,
  FaCheckCircle,
  FaArrowRight,
} from "react-icons/fa";
import styles from "./Classes.module.css";

const locations = [
  {
    id: "douglas",
    name: "Douglas",
    theme: "honey",
    day: "Fridays",
    times: ["8:00 am", "12:00 pm", "4:30 pm"],
    timesNote: "3 classes every Friday",
    steps: [
      {
        icon: FaClock,
        title: "Pick your time",
        text: "Choose the Friday time slot that suits you and your baby best.",
      },
      {
        icon: FaSyncAlt,
        title: "Same time, every Friday",
        text: "Once you pick a time, you're registered for that time slot for 5 weeks, every Friday.",
      },
      {
        icon: FaUsers,
        title: "5 parents per class",
        text: "Each time slot is its own class made up of 5 parents, so every parent gets individual attention.",
      },
      {
        icon: FaCheckCircle,
        title: "Class is full, you're set",
        text: "When the 5 spots for your time are filled, that group meets every Friday at that same time. The same goes for each of the three time slots.",
      },
    ],
    cta: "Book a Douglas class",
    href: "/book?location=douglas",
  },
  {
    id: "kimberley",
    name: "Kimberley",
    theme: "green",
    day: "Saturdays",
    times: ["10:00 am"],
    timesNote: "1 class every Saturday",
    steps: [
      {
        icon: FaClock,
        title: "Saturday at 10:00 am",
        text: "Kimberley classes run on Saturdays at 10:00 am.",
      },
      {
        icon: FaSyncAlt,
        title: "Same time, every Saturday",
        text: "Once you register, your spot is saved for 5 weeks, every Saturday at 10:00 am.",
      },
      {
        icon: FaUsers,
        title: "5 parents per class",
        text: "The class is made up of 5 parents for a calm space and individual attention.",
      },
      {
        icon: FaCheckCircle,
        title: "Class is full, you're set",
        text: "When the 5 spots are filled, the group meets every Saturday at 10:00 am for the 5 weeks.",
      },
    ],
    cta: "Book a Kimberley class",
    href: "/book?location=kimberley",
  },
];

export const metadata = {
  title: "Classes | BeeWell Infant Spa",
  description:
    "How our baby massage classes work in Douglas and Kimberley: days, times and group sizes.",
};

export default function Classes() {
  return (
    <main className={styles.page} id="classes">
      <header className={styles.header}>
        <p className={styles.eyebrow}>
          <FaCalendarCheck aria-hidden="true" /> 5 classes over 5 weeks
        </p>
        <h1 className={styles.title}>
          How our <span className={styles.highlight}>classes</span> work
        </h1>
        <p className={styles.intro}>
          Choose the town closest to you. Every class is a small group of 5
          parents, and your time slot stays the same for all 5 weeks.
        </p>
      </header>

      <div className={styles.grid}>
        {locations.map((loc) => (
          <article
            key={loc.id}
            className={`${styles.card} ${styles[loc.theme]}`}
          >
            <div className={styles.cardTop}>
              <span className={styles.pin}>
                <FaMapMarkerAlt aria-hidden="true" />
              </span>
              <h2 className={styles.town}>{loc.name}</h2>
              <p className={styles.day}>
                <FaCalendarDay aria-hidden="true" /> {loc.day}
              </p>
            </div>

            <div className={styles.times}>
              <p className={styles.timesLabel}>{loc.timesNote}</p>
              <ul className={styles.timeList}>
                {loc.times.map((t) => (
                  <li key={t} className={styles.time}>
                    <FaClock aria-hidden="true" /> {t}
                  </li>
                ))}
              </ul>
            </div>

            <ol className={styles.steps}>
              {loc.steps.map(({ icon: Icon, title, text }) => (
                <li key={title} className={styles.step}>
                  <span className={styles.stepIcon}>
                    <Icon aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className={styles.stepTitle}>{title}</h3>
                    <p className={styles.stepText}>{text}</p>
                  </div>
                </li>
              ))}
            </ol>

            <Link href={loc.href} className={styles.cta}>
              {loc.cta}
              <FaArrowRight aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
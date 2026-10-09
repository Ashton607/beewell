import { FaCalendarCheck } from "react-icons/fa";
import BookingFlow from "./Bookingflow";
import styles from "./Booking.module.css";

export const metadata = {
  title: "Book a Class | BeeWell Infant Spa",
  description:
    "Book your baby massage class in Douglas or Kimberley. Choose your location, date and time in a few easy steps.",
};

export default function BookPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>
          <FaCalendarCheck aria-hidden="true" /> 5 classes over 5 weeks
        </p>
        <h1 className={styles.title}>
          Book your <span className={styles.highlight}>class</span>
        </h1>
        <p className={styles.intro}>
          Choose your town, pick a start date and time, and tell us a little
          about you. Your time slot stays the same for all 5 weeks.
        </p>
      </header>

      <BookingFlow />
    </main>
  );
}
import { FaCalendarCheck } from "react-icons/fa";
import styles from "@/components/book/Booking.module.css";
import BookingFlow from "@/components/book/Bookingflow";

// Set to false when bookings reopen
// Made edits to this page and api/checkout/route.js to prevent bookings while the site is closed for the year.
const BOOKINGS_PAUSED = true;
const REOPEN_TEXT = "January 2027"; // change to your real date

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
          {BOOKINGS_PAUSED
            ? `Bookings are closed for now and reopen in ${REOPEN_TEXT}. Please get in touch if you'd like to be told when classes start again.`
            : "Choose your town, pick a start date and time, and tell us a little about you. Your time slot stays the same for all 5 weeks."}
        </p>
      </header>

      {!BOOKINGS_PAUSED && <BookingFlow />}
    </main>
  );
}
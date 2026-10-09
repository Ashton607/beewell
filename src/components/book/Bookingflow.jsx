"use client";

import { useEffect, useState } from "react";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaChevronLeft,
  FaChevronRight,
  FaLock,
  FaCheck,
  FaCheckCircle,
  FaArrowRight,
  FaArrowLeft,
  FaUsers,
  FaEnvelope,
  FaPhoneAlt,
  FaCalendarCheck,
  FaSpinner,
} from "react-icons/fa";
import styles from "./Booking.module.css";

/* ---------- Settings ---------- */
const CAPACITY = 5; // parents per class
const WEEKS = 5; // classes per booking
const PRICE = "R1000";

const LOCATIONS = [
  {
    id: "douglas",
    name: "Douglas",
    dayName: "Fridays",
    weekday: 5, // Friday (Sunday = 0)
    times: [
      { id: "08:00", label: "8:00 am" },
      { id: "12:00", label: "12:00 pm" },
      { id: "16:30", label: "4:30 pm" },
    ],
  },
  {
    id: "kimberley",
    name: "Kimberley",
    dayName: "Saturdays",
    weekday: 6, // Saturday
    times: [{ id: "10:00", label: "10:00 am" }],
  },
];

/* ---------- Date helpers ---------- */
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d, n) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const sameDay = (a, b) =>
  a && b && a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const formatLong = (d) =>
  d.toLocaleDateString("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
const formatShort = (d) =>
  d.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" });
// "YYYY-MM-DD" in the browser's local date, for the availability API
const toISODate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const STEPS = ["Location", "Date", "Time", "Details", "Confirm"];
const WEEKDAY_HEADERS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

/* ---------- Small building blocks ---------- */
function Panel({ number, icon: Icon, title, locked, children }) {
  return (
    <section className={`${styles.panel} ${locked ? styles.locked : ""}`}>
      <header className={styles.panelHead}>
        <span className={styles.panelNumber}>{number}</span>
        <h2 className={styles.panelTitle}>
          <Icon aria-hidden="true" /> {title}
        </h2>
      </header>
      {children}
    </section>
  );
}

function LockedNote({ text }) {
  return (
    <p className={styles.lockedNote}>
      <FaLock aria-hidden="true" /> {text}
    </p>
  );
}

function Calendar({ today, location, selected, onSelect }) {
  const [offset, setOffset] = useState(0);

  if (!today) return <p className={styles.lockedNote}>Loading calendar…</p>;

  const view = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const lead = (view.getDay() + 6) % 7; // Monday first

  const cells = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from(
      { length: daysInMonth },
      (_, i) => new Date(view.getFullYear(), view.getMonth(), i + 1)
    ),
  ];

  const isAvailable = (d) =>
    Boolean(location) && d.getDay() === location.weekday && d >= today;

  return (
    <div className={styles.calendar}>
      <div className={styles.calHead}>
        <button
          type="button"
          className={styles.calNav}
          onClick={() => setOffset((o) => o - 1)}
          disabled={offset === 0}
          aria-label="Previous month"
        >
          <FaChevronLeft aria-hidden="true" />
        </button>
        <p className={styles.calMonth}>
          {view.toLocaleDateString("en-ZA", { month: "long", year: "numeric" })}
        </p>
        <button
          type="button"
          className={styles.calNav}
          onClick={() => setOffset((o) => o + 1)}
          disabled={offset >= 5}
          aria-label="Next month"
        >
          <FaChevronRight aria-hidden="true" />
        </button>
      </div>

      <div className={styles.calGrid}>
        {WEEKDAY_HEADERS.map((d) => (
          <span key={d} className={styles.calWeekday}>
            {d}
          </span>
        ))}

        {cells.map((date, i) => {
          if (!date) return <span key={`blank-${i}`} />;
          const available = isAvailable(date);
          const isSelected = sameDay(date, selected);
          const classes = [
            styles.day,
            available ? styles.dayAvailable : "",
            isSelected ? styles.daySelected : "",
            sameDay(date, today) ? styles.dayToday : "",
          ].join(" ");
          return (
            <button
              key={date.toISOString()}
              type="button"
              className={classes}
              disabled={!available}
              aria-pressed={isSelected}
              aria-label={formatLong(date)}
              onClick={() => onSelect(date)}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <p className={styles.calHint}>
        {location
          ? `Only ${location.dayName} are available in ${location.name}.`
          : "Choose a location to see available dates."}
      </p>
    </div>
  );
}

/* ---------- Main flow ---------- */
export default function BookingFlow() {
  const [today, setToday] = useState(null);
  const [locationId, setLocationId] = useState(null);
  const [date, setDate] = useState(null);
  const [timeId, setTimeId] = useState(null);
  const [details, setDetails] = useState({ name: "", email: "", phone: "" });
  const [stage, setStage] = useState("select"); // select | confirm | done

  // Live availability from /api/availability
  const [timesData, setTimesData] = useState([]);
  const [timesStatus, setTimesStatus] = useState("idle"); // idle | loading | ready | error
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setToday(startOfDay(new Date()));
  }, []);

  // Check the live calendar whenever the location or date changes
  useEffect(() => {
    if (!locationId || !date) {
      setTimesData([]);
      setTimesStatus("idle");
      return;
    }

    const controller = new AbortController();
    setTimesStatus("loading");

    fetch(`/api/availability?location=${locationId}&date=${toISODate(date)}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then((data) => {
        setTimesData(data.times);
        setTimesStatus("ready");
      })
      .catch((err) => {
        if (err.name !== "AbortError") setTimesStatus("error");
      });

    return () => controller.abort();
  }, [locationId, date, retryCount]);

  const location = LOCATIONS.find((l) => l.id === locationId) ?? null;
  const time = location?.times.find((t) => t.id === timeId) ?? null;

  // Full times (0 spots left) are not shown
  const availableTimes = timesData.filter((t) => !t.full);

  const classDates = date
    ? Array.from({ length: WEEKS }, (_, i) => addDays(date, i * 7))
    : [];

  let currentStep = 1;
  if (stage !== "select") currentStep = 5;
  else if (!location) currentStep = 1;
  else if (!date) currentStep = 2;
  else if (!time) currentStep = 3;
  else currentStep = 4;

  const chooseLocation = (id) => {
    setLocationId(id);
    setDate(null);
    setTimeId(null);
  };

  const chooseDate = (d) => {
    setDate(d);
    setTimeId(null);
    setTimesData([]); // avoid flashing the previous date's times
    setTimesStatus("loading");
  };

  const updateDetail = (e) =>
    setDetails((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const goToConfirm = (e) => {
    e.preventDefault();
    setStage("confirm");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // TODO: send the booking to the calendar / email here
  const confirmBooking = () => {
    setStage("done");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startOver = () => {
    setLocationId(null);
    setDate(null);
    setTimeId(null);
    setDetails({ name: "", email: "", phone: "" });
    setStage("select");
  };

  return (
    <div className={styles.flow}>
      {/* Progress */}
      {stage !== "done" && (
        <ol className={styles.steps} aria-label="Booking progress">
          {STEPS.map((label, i) => {
            const n = i + 1;
            const state =
              n < currentStep ? styles.stepDone : n === currentStep ? styles.stepActive : "";
            return (
              <li key={label} className={`${styles.step} ${state}`}>
                <span className={styles.stepDot}>
                  {n < currentStep ? <FaCheck aria-hidden="true" /> : n}
                </span>
                <span className={styles.stepLabel}>{label}</span>
              </li>
            );
          })}
        </ol>
      )}

      {/* 4 panels */}
      {stage === "select" && (
        <div className={styles.grid}>
          {/* 1. Location */}
          <Panel number={1} icon={FaMapMarkerAlt} title="Choose a location">
            <div className={styles.locations} role="radiogroup" aria-label="Location">
              {LOCATIONS.map((loc) => (
                <label key={loc.id} className={styles.locCard}>
                  <input
                    type="radio"
                    name="location"
                    value={loc.id}
                    checked={locationId === loc.id}
                    onChange={() => chooseLocation(loc.id)}
                  />
                  <span className={styles.locBody}>
                    <span className={styles.locCheck}>
                      <FaCheck aria-hidden="true" />
                    </span>
                    <span>
                      <strong className={styles.locName}>{loc.name}</strong>
                      <span className={styles.locDay}>{loc.dayName}</span>
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </Panel>

          {/* 2. Date */}
          <Panel number={2} icon={FaCalendarAlt} title="Pick a start date" locked={!location}>
            <Calendar
              today={today}
              location={location}
              selected={date}
              onSelect={chooseDate}
            />
          </Panel>

          {/* 3. Times */}
          <Panel number={3} icon={FaClock} title="Available times" locked={!date}>
            {!date ? (
              <LockedNote text="Pick a date to see the available times." />
            ) : timesStatus === "loading" ? (
              <p className={styles.statusNote}>
                <FaSpinner className={styles.spin} aria-hidden="true" />
                Checking availability…
              </p>
            ) : timesStatus === "error" ? (
              <div className={styles.errorBox}>
                <p>We couldn&apos;t check availability right now.</p>
                <button
                  type="button"
                  className={styles.retry}
                  onClick={() => setRetryCount((n) => n + 1)}
                >
                  Try again
                </button>
              </div>
            ) : availableTimes.length === 0 ? (
              <p className={styles.fullNote}>
                All times are full for this date. Please try another date.
              </p>
            ) : (
              <div className={styles.times} role="radiogroup" aria-label="Time">
                {availableTimes.map((t) => (
                  <label key={t.id} className={styles.timeCard}>
                    <input
                      type="radio"
                      name="time"
                      value={t.id}
                      checked={timeId === t.id}
                      onChange={() => setTimeId(t.id)}
                    />
                    <span className={styles.timeBody}>
                      <span className={styles.timeLabel}>
                        <FaClock aria-hidden="true" /> {t.label}
                      </span>
                      <span className={styles.spots}>
                        <FaUsers aria-hidden="true" />
                        {t.spotsLeft === 1
                          ? "Last spot!"
                          : `${t.spotsLeft} of ${CAPACITY} spots left`}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </Panel>

          {/* 4. Customer details */}
          <Panel number={4} icon={FaUser} title="Your details" locked={!time}>
            <form onSubmit={goToConfirm}>
              <fieldset className={styles.fields} disabled={!time}>
                <label className={styles.field}>
                  <span className={styles.srOnly}>Name</span>
                  <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    autoComplete="name"
                    value={details.name}
                    onChange={updateDetail}
                    required
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.srOnly}>Email address</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    autoComplete="email"
                    value={details.email}
                    onChange={updateDetail}
                    required
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.srOnly}>Phone number</span>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone number"
                    autoComplete="tel"
                    value={details.phone}
                    onChange={updateDetail}
                    required
                  />
                </label>

                <button type="submit" className={styles.primary}>
                  Continue to confirmation
                  <FaArrowRight aria-hidden="true" />
                </button>
              </fieldset>
              {!time && <LockedNote text="Choose a time to continue." />}
            </form>
          </Panel>
        </div>
      )}

      {/* Confirmation panel */}
      {stage === "confirm" && (
        <section className={styles.confirm}>
          <h2 className={styles.confirmTitle}>Confirm your booking</h2>
          <p className={styles.confirmSub}>
            Please check everything below before you book.
          </p>

          <dl className={styles.summary}>
            <div className={styles.summaryRow}>
              <dt><FaMapMarkerAlt aria-hidden="true" /> Location</dt>
              <dd>{location.name}</dd>
            </div>
            <div className={styles.summaryRow}>
              <dt><FaCalendarAlt aria-hidden="true" /> First class</dt>
              <dd>{formatLong(date)}</dd>
            </div>
            <div className={styles.summaryRow}>
              <dt><FaClock aria-hidden="true" /> Time</dt>
              <dd>{time.label}, every {location.dayName.slice(0, -1)}</dd>
            </div>
            <div className={styles.summaryRow}>
              <dt><FaUser aria-hidden="true" /> Name</dt>
              <dd>{details.name}</dd>
            </div>
            <div className={styles.summaryRow}>
              <dt><FaEnvelope aria-hidden="true" /> Email</dt>
              <dd>{details.email}</dd>
            </div>
            <div className={styles.summaryRow}>
              <dt><FaPhoneAlt aria-hidden="true" /> Phone</dt>
              <dd>{details.phone}</dd>
            </div>
          </dl>

          <div className={styles.weeks}>
            <p className={styles.weeksTitle}>
              Your {WEEKS} classes ({PRICE} in total)
            </p>
            <ul className={styles.weekList}>
              {classDates.map((d, i) => (
                <li key={d.toISOString()} className={styles.weekItem}>
                  <span>Week {i + 1}</span>
                  <strong>{formatShort(d)}</strong>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.confirmActions}>
            <button
              type="button"
              className={styles.secondary}
              onClick={() => setStage("select")}
            >
              <FaArrowLeft aria-hidden="true" />
              Edit details
            </button>
            <button type="button" className={styles.primary} onClick={confirmBooking}>
              <FaCalendarCheck aria-hidden="true" />
              Confirm and book
            </button>
          </div>
        </section>
      )}

      {/* Done (design placeholder) */}
      {stage === "done" && (
        <section className={styles.done}>
          <span className={styles.doneIcon}>
            <FaCheckCircle aria-hidden="true" />
          </span>
          <h2 className={styles.confirmTitle}>You&apos;re booked in!</h2>
          <p className={styles.confirmSub}>
            Thank you, {details.name}. We&apos;ll send a confirmation to{" "}
            {details.email}.
          </p>
          <button type="button" className={styles.secondary} onClick={startOver}>
            Book another class
          </button>
        </section>
      )}
    </div>
  );
}
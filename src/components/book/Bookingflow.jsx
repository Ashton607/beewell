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
const toISODate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const STEPS = ["Location", "Date", "Time", "Details", "Confirm"];
const WEEKDAY_HEADERS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

/* ---------- Small building blocks ---------- */
function Panel({ number, icon: Icon, title, locked, children }) {
  return (
    <section className={`${styles.panel}${locked ? styles.locked : ""}`}>
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
  const lead = (view.getDay() + 6) % 7;

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
          ? `Only ${location.dayName} are available in${location.name}.`
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
  
  // State for Parent and Baby details including T&Cs acceptance
  const [details, setDetails] = useState({
    parentName: "",
    relationship: "",
    phone: "",
    email: "",
    babyName: "",
    babyDob: "",
    preferredName: "",
    hasHealthConditions: false,
    medicalNotes: "",
    doctorName: "",
    doctorPhone: "",
    productConsent: true,
    photoConsent: false,
    acceptTerms: false,
  });

  const [stage, setStage] = useState("select");

  const [timesData, setTimesData] = useState([]);
  const [timesStatus, setTimesStatus] = useState("idle");
  const [retryCount, setRetryCount] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    setToday(startOfDay(new Date()));
  }, []);

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
    setTimesData([]);
    setTimesStatus("loading");
  };

  const updateDetail = (e) => {
    const { name, value, type, checked } = e.target;
    setDetails((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const goToConfirm = (e) => {
    e.preventDefault();
    if (!details.acceptTerms) {
      setBookingError("Please accept the Terms and Conditions to continue.");
      return;
    }
    setBookingError("");
    setStage("confirm");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmBooking = async () => {
    setSubmitting(true);
    setBookingError("");

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: locationId,
          date: toISODate(date),
          time: timeId,
          ...details,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 409) {
        setTimeId(null);
        setRetryCount((n) => n + 1);
        setBookingError(
          data.error ?? "That time was just filled. Please choose another."
        );
        setStage("select");
        return;
      }

      if (!res.ok) throw new Error(data.error ?? "Booking failed");

      setEmailSent(Boolean(data.emailSent));
      setStage("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setBookingError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const startOver = () => {
    setLocationId(null);
    setDate(null);
    setTimeId(null);
    setDetails({
      parentName: "",
      relationship: "",
      phone: "",
      email: "",
      babyName: "",
      babyDob: "",
      preferredName: "",
      hasHealthConditions: false,
      medicalNotes: "",
      doctorName: "",
      doctorPhone: "",
      productConsent: true,
      photoConsent: false,
      acceptTerms: false,
    });
    setBookingError("");
    setEmailSent(false);
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
              <li key={label} className={`${styles.step}${state}`}>
                <span className={styles.stepDot}>
                  {n < currentStep ? <FaCheck aria-hidden="true" /> : n}
                </span>
                <span className={styles.stepLabel}>{label}</span>
              </li>
            );
          })}
        </ol>
      )}

      {stage === "select" && bookingError && (
        <p className={`${styles.errorBox}${styles.bookingError}`} role="alert">
          {bookingError}
        </p>
      )}

      {/* Panels */}
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
                          : `${t.spotsLeft} of${CAPACITY} spots left`}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </Panel>

          {/* 4. Parent & Baby Details Form */}
          <Panel number={4} icon={FaUser} title="Parent & Baby Details" locked={!time}>
            <form onSubmit={goToConfirm}>
              <fieldset className={styles.fields} disabled={!time}>
                
                {/* Parent / Legal Guardian Section */}
                <h3 className={styles.subSectionTitle}>Parent / Legal Guardian Details</h3>
                
                <label className={styles.field}>
                  <span className={styles.srOnly}>Parent/Guardian Full Name</span>
                  <input
                    type="text"
                    name="parentName"
                    placeholder="Parent/Guardian Full Name *"
                    autoComplete="name"
                    value={details.parentName}
                    onChange={updateDetail}
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.srOnly}>Relationship to Baby</span>
                  <input
                    type="text"
                    name="relationship"
                    placeholder="Relationship to Baby (e.g. Mother, Father) *"
                    value={details.relationship}
                    onChange={updateDetail}
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.srOnly}>Cellphone Number</span>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Cellphone Number *"
                    autoComplete="tel"
                    value={details.phone}
                    onChange={updateDetail}
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.srOnly}>Email Address</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address *"
                    autoComplete="email"
                    value={details.email}
                    onChange={updateDetail}
                    required
                  />
                </label>

                {/* Baby's Details Section */}
                <h3 className={styles.subSectionTitle}>Baby&apos;s Details</h3>

                <label className={styles.field}>
                  <span className={styles.srOnly}>Baby&apos;s Full Name</span>
                  <input
                    type="text"
                    name="babyName"
                    placeholder="Baby&apos;s Full Name *"
                    value={details.babyName}
                    onChange={updateDetail}
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Baby&apos;s Date of Birth *</span>
                  <input
                    type="date"
                    name="babyDob"
                    value={details.babyDob}
                    onChange={updateDetail}
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.srOnly}>Preferred Name</span>
                  <input
                    type="text"
                    name="preferredName"
                    placeholder="Baby&apos;s Preferred Name (Optional)"
                    value={details.preferredName}
                    onChange={updateDetail}
                  />
                </label>

                {/* Expandable Health Conditions Section */}
                <div className={styles.checkboxField}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="hasHealthConditions"
                      checked={details.hasHealthConditions}
                      onChange={updateDetail}
                    />
                    <span>My baby has a health condition, allergy, or special consideration</span>
                  </label>
                </div>

                {details.hasHealthConditions && (
                  <div className={styles.conditionalBlock}>
                    <label className={styles.field}>
                      <span className={styles.srOnly}>Health Conditions Details</span>
                      <textarea
                        name="medicalNotes"
                        placeholder="Please describe any health conditions, allergies, or special considerations..."
                        rows="3"
                        value={details.medicalNotes}
                        onChange={updateDetail}
                        className={styles.textarea}
                      />
                    </label>

                    <label className={styles.field}>
                      <span className={styles.srOnly}>Medical Practitioner Name</span>
                      <input
                        type="text"
                        name="doctorName"
                        placeholder="Medical Practitioner / Paediatrician Name"
                        value={details.doctorName}
                        onChange={updateDetail}
                      />
                    </label>

                    <label className={styles.field}>
                      <span className={styles.srOnly}>Medical Practitioner Contact Number</span>
                      <input
                        type="tel"
                        name="doctorPhone"
                        placeholder="Medical Practitioner Contact Number"
                        value={details.doctorPhone}
                        onChange={updateDetail}
                      />
                    </label>
                  </div>
                )}

                {/* Consents & T&Cs */}
                <h3 className={styles.subSectionTitle}>Consents & Terms</h3>

                <div className={styles.checkboxGroup}>
                  <p className={styles.groupTitle}>Topical Products Consent</p>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="productConsent"
                      checked={details.productConsent}
                      onChange={updateDetail}
                    />
                    <span>Yes, I consent to approved topical products/oils being used</span>
                  </label>
                </div>

                <div className={styles.checkboxGroup}>
                  <p className={styles.groupTitle}>Marketing Photo/Video Consent</p>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="photoConsent"
                      checked={details.photoConsent}
                      onChange={updateDetail}
                    />
                    <span>Yes, I consent to photos/videos being used for marketing and social media</span>
                  </label>
                </div>

                <div className={styles.checkboxField}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="acceptTerms"
                      checked={details.acceptTerms}
                      onChange={updateDetail}
                      required
                    />
                    <span>
                      I accept the <a href="/terms" target="_blank" rel="noopener noreferrer" className={styles.termsLink}>Terms and Conditions</a> *
                    </span>
                  </label>
                </div>

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
              <dt><FaUser aria-hidden="true" /> Parent Name</dt>
              <dd>{details.parentName} ({details.relationship})</dd>
            </div>
            <div className={styles.summaryRow}>
              <dt><FaUser aria-hidden="true" /> Baby Name</dt>
              <dd>{details.babyName} (DOB: {details.babyDob})</dd>
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

          {bookingError && (
            <p className={`${styles.errorBox}${styles.bookingError}`} role="alert">
              {bookingError}
            </p>
          )}

          <div className={styles.confirmActions}>
            <button
              type="button"
              className={styles.secondary}
              disabled={submitting}
              onClick={() => {
                setBookingError("");
                setStage("select");
              }}
            >
              <FaArrowLeft aria-hidden="true" />
              Edit details
            </button>
            <button
              type="button"
              className={styles.primary}
              onClick={confirmBooking}
              disabled={submitting}
            >
              {submitting ? (
                <FaSpinner className={styles.spin} aria-hidden="true" />
              ) : (
                <FaCalendarCheck aria-hidden="true" />
              )}
              {submitting ? "Booking…" : "Confirm and book"}
            </button>
          </div>
        </section>
      )}

      {/* Done */}
      {stage === "done" && (
        <section className={styles.done}>
          <span className={styles.doneIcon}>
            <FaCheckCircle aria-hidden="true" />
          </span>
          <h2 className={styles.confirmTitle}>You&apos;re booked in!</h2>
          <p className={styles.confirmSub}>
            {emailSent
              ? `Thank you, ${details.parentName}. A confirmation has been sent to ${details.email}.`
              : `Thank you, ${details.parentName}. Your booking is saved, but we couldn't send the confirmation email. We'll be in touch shortly.`}
          </p>
          <button type="button" className={styles.secondary} onClick={startOver}>
            Book another class
          </button>
        </section>
      )}
    </div>
  );
}
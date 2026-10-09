import {
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaClock,
  FaInstagram,
  FaFacebookF,
  FaWhatsapp,
  FaPaperPlane,
} from "react-icons/fa";
import styles from "./Contact.module.css";

/* ---------- Edit these ---------- */
const CONTACT_IMAGE = "/contact/contact.webp";
const EMAIL = "Pennydev1@gmail.com";
const PHONE = "+27 82 457 6296";

const enquiryTypes = [
  { value: "classes", label: "Classes" },
  { value: "bookings", label: "Bookings" },
  { value: "payments", label: "Payments" },
  { value: "times", label: "Times & Venues" },
  { value: "other", label: "Other" },
];

const socials = [
  { icon: FaInstagram, label: "Instagram", href: "#" },
  { icon: FaFacebookF, label: "Facebook", href: "#" },
  { icon: FaWhatsapp, label: "WhatsApp", href: "#" },
];
/* -------------------------------- */



export default function Contact() {
  return (
    <main className={styles.page}>
      <section
        className={styles.wrap}
        style={{ "--contact-image": `url(${CONTACT_IMAGE})` }}
      >
        <div className={styles.overlay} />

        <div className={styles.inner}>
          {/* Left: info */}
          <div className={styles.info}>
            <h1 className={styles.title}>
              Have Questions?
              <br />
              <span className={styles.highlight}>I Have Answers</span>
            </h1>
            <p className={styles.lead}>
              Whether you want to know more about our classes, need help with a
              booking or have a question about payments, send me a message and
              we&apos;ll take it from there.
            </p>

            <div className={styles.details}>
              <div className={styles.detail}>
                <h2>
                  <FaMapMarkerAlt aria-hidden="true" /> Location
                </h2>
                <p>Douglas and Kimberley</p>
                <p>Northern Cape, South Africa</p>
              </div>

              <div className={styles.detail}>
                <h2>
                  <FaClock aria-hidden="true" /> Class days
                </h2>
                <p>Douglas: Fridays</p>
                <p>Kimberley: Saturdays</p>
              </div>

              <div className={styles.detail}>
                <h2>
                  <FaEnvelope aria-hidden="true" /> Email
                </h2>
                <p>
                  <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
                </p>
              </div>

              <div className={styles.detail}>
                <h2>
                  <FaPhoneAlt aria-hidden="true" /> Contact
                </h2>
                <p>
                  <a href={`tel:${PHONE.replace(/\s/g, "")}`}>{PHONE}</a>
                </p>
              </div>
            </div>

            <ul className={styles.socials} aria-label="Social media">
              {socials.map(({ icon: Icon, label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className={styles.social}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: form (design only, no submit logic yet) */}
          <form className={styles.form}>
            <h2 className={styles.formTitle}>Send a message</h2>
            <p className={styles.formSub}>
              We&apos;re happy to help with anything, big or small.
            </p>

            <label className={styles.field}>
              <span className={styles.srOnly}>Name</span>
              <input
                type="text"
                name="name"
                placeholder="Name"
                autoComplete="name"
                required
              />
            </label>

            <div className={styles.row}>
              <label className={styles.field}>
                <span className={styles.srOnly}>Email address</span>
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  autoComplete="email"
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
                />
              </label>
            </div>

            <fieldset className={styles.types}>
              <legend>Type of enquiry</legend>
              <div className={styles.chips}>
                {enquiryTypes.map(({ value, label }, i) => (
                  <label key={value} className={styles.chip}>
                    <input
                      type="radio"
                      name="enquiryType"
                      value={value}
                      defaultChecked={i === 0}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className={styles.field}>
              <span className={styles.srOnly}>Message</span>
              <textarea
                name="message"
                rows={5}
                placeholder="Message"
                required
              />
            </label>

            <button type="submit" className={styles.submit}>
              <FaPaperPlane aria-hidden="true" />
              Send message
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
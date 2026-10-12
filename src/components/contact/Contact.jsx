import {
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaClock,
  FaInstagram,
  FaFacebookF,
  FaWhatsapp,
} from "react-icons/fa";
import ContactForm from "./ContactForm";
import styles from "./Contact.module.css";

/* ---------- Edit these ---------- */
const CONTACT_IMAGE = "/contact/contact.webp";
const EMAIL = "Pennydev1@gmail.com";
const PHONE = "+27 82 457 6296";

const socials = [
  { icon: FaInstagram, label: "Instagram", href: "#" },
  { icon: FaFacebookF, label: "Facebook", href: "#" },
  { icon: FaWhatsapp, label: "WhatsApp", href: "https://wa.me/27824576296" },
];
/* -------------------------------- */

export default function ContactPage() {
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
              <span className={styles.highlight}>We Have Answers</span>
            </h1>
            <p className={styles.lead}>
              Whether you want to know more about our classes, need help with a
              booking or have a question about payments, send us a message and
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

          {/* Right: form (client component) */}
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
import Link from "next/link";
import {
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaInstagram,
  FaFacebookF,
  FaWhatsapp,
  FaChevronRight,
  FaHeart,
} from "react-icons/fa";
import styles from "./Footer.module.css";

/* ---------- Edit these ---------- */
const LOGO_IMAGE = "/hero/logo.jpeg"; 
const IAIM_LOGO = "/hero/IAIM.jpg"; 
const IAIM_URL = "https://iaimsa.co.za"; 
const EMAIL = "pennydev5@gmail.com";
const PHONE = "+27 82 457 6296";
const YEAR = 2026;
const DESIGNER_URL = "https://luxinteractive.co.za";

const pages = [
  { href: "/", label: "Home" },
  { href: "/classes", label: "Classes" },
  { href: "/benefits", label: "Benefits" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/book", label: "Book a class" },
];

const socials = [
  { icon: FaInstagram, label: "Instagram", href: "https://www.instagram.com/penny.seabrook.7?cplk=MW5wc2FrdWN3MWdjeQ%3D%3D" },
  { icon: FaFacebookF, label: "Facebook", href: "https://www.facebook.com/people/BeeWell-Infant-Spa/100065337464162" },
  { icon: FaWhatsapp, label: "WhatsApp", href: "https://wa.me/27824576296" },
];
/* -------------------------------- */

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {/* Brand */}
        <div className={styles.brand}>
          <Link href="/" className={styles.logoLink} aria-label="BeeWell Infant Spa home">
            <span
              className={styles.logo}
              style={{ "--logo-image": `url(${LOGO_IMAGE})` }}
              role="img"
              aria-label="BeeWell Infant Spa logo"
            />
            <span className={styles.brandName}>
              <span className={styles.bee}>Bee</span>Well
              <small>Infant Spa</small>
            </span>
          </Link>

          <p className={styles.tagline}>
            Gentle touch. Big benefits. Baby massage classes for babies from 0
            – 12 months.
          </p>

          <a
            href={IAIM_URL}
            className={styles.iaim}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="IAIM Accredited (opens the IAIM website in a new tab)"
          >
            <span
              className={styles.iaimLogo}
              style={{ "--iaim-image": `url(${IAIM_LOGO})` }}
              role="img"
              aria-label="IAIM logo"
            />
            <span className={styles.iaimText}>IAIM Accredited</span>
          </a>
        </div>

        {/* Quick links */}
        <nav className={styles.column} aria-label="Footer navigation">
          <h2 className={styles.heading}>Quick links</h2>
          <ul className={styles.list}>
            {pages.map((p) => (
              <li key={p.href}>
                <Link href={p.href} className={styles.link}>
                  <FaChevronRight aria-hidden="true" />
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Class days */}
        <div className={styles.column}>
          <h2 className={styles.heading}>Class days</h2>
          <ul className={styles.list}>
            <li className={styles.info}>
              <strong>Douglas</strong>
              <span>Fridays: 8:00 am, 10:00 am, 4:30 pm</span>
            </li>
            <li className={styles.info}>
              <strong>Kimberley</strong>
              <span>Saturdays: 10:00 am</span>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className={styles.column}>
          <h2 className={styles.heading}>Get in touch</h2>
          <ul className={styles.list}>
            <li className={styles.contactItem}>
              <FaMapMarkerAlt aria-hidden="true" />
              <span>Douglas and Kimberley, Northern Cape</span>
            </li>
            <li className={styles.contactItem}>
              <FaEnvelope aria-hidden="true" />
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </li>
            <li className={styles.contactItem}>
              <FaPhoneAlt aria-hidden="true" />
              <a href={`tel:${PHONE.replace(/\s/g, "")}`}>{PHONE}</a>
            </li>
          </ul>

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
      </div>

      <div className={styles.bottom}>
        <p>
          &copy; {YEAR} BeeWell Infant Spa. All rights reserved.
        </p>
        <nav className={styles.legal} aria-label="Legal">
          <Link href="/terms" className={styles.legalLink}>
            Terms &amp; Conditions
          </Link>
          <Link href="/privacy" className={styles.legalLink}>
            Privacy Policy
          </Link>
        </nav>
        <p className={styles.made}>
          Made with <FaHeart aria-hidden="true" /> for little ones
          <span className={styles.dot} aria-hidden="true">
            •
          </span>
          Designed by{" "}
          <a
            href={DESIGNER_URL}
            className={styles.credit}
            target="_blank"
            rel="noopener noreferrer"
          >
            Luxinteractive
          </a>
        </p>
      </div>
    </footer>
  );
}
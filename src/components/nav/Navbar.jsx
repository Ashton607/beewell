"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./Navbar.module.css";

const links = [
  { href: "/#home", label: "Home" },
  { href: "/#classes", label: "Classes" },
  { href: "/#benefits", label: "Benefits" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Main navigation">
        <Link href="/" className={styles.logo} onClick={close}>
          <span className={styles.logoBee} aria-hidden="true">
            🐝
          </span>
          <span className={styles.logoText}>
            <span className={styles.logoBee2}>Bee</span>
            <span className={styles.logoWell}>Well</span>
            <span className={styles.logoSub}>Infant Spa</span>
          </span>
        </Link>

        <ul className={`${styles.links} ${open ? styles.open : ""}`}>
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={styles.link} onClick={close}>
                {link.label}
              </Link>
            </li>
          ))}
          <li className={styles.ctaItem}>
            <Link href="/book" className={styles.cta} onClick={close}>
              Book a class
            </Link>
          </li>
        </ul>

        <button
          type="button"
          className={styles.toggle}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span className={`${styles.bar} ${open ? styles.barTop : ""}`} />
          <span className={`${styles.bar} ${open ? styles.barMid : ""}`} />
          <span className={`${styles.bar} ${open ? styles.barBot : ""}`} />
        </button>
      </nav>
    </header>
  );
}
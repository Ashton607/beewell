"use client";

import { useState } from "react";
import { FaPaperPlane, FaSpinner, FaCheckCircle } from "react-icons/fa";
import { ENQUIRY_TYPES } from "@/lib/classconfig";
import styles from "./Contact.module.css";

export default function ContactForm() {
  const [status, setStatus] = useState("idle"); // idle | sending | sent
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));

    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(result.error || "Something went wrong.");

      setStatus("sent");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return (
      <div className={`${styles.form} ${styles.success}`}>
        <span className={styles.successIcon}>
          <FaCheckCircle aria-hidden="true" />
        </span>
        <h2 className={styles.formTitle}>Message sent!</h2>
        <p className={styles.formSub}>
          Thank you for getting in touch. We&apos;ll reply as soon as we can.
        </p>
        <button
          type="button"
          className={styles.again}
          onClick={() => setStatus("idle")}
        >
          Send another message
        </button>
      </div>
    );
  }

  const sending = status === "sending";

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.formTitle}>Send us a message</h2>
      <p className={styles.formSub}>
        We&apos;re happy to help with anything, big or small.
      </p>

      {/* Spam trap: real people never see or fill this in */}
      <div className={styles.honeypot} aria-hidden="true">
        <label>
          Website
          <input 
          type="text" 
          name="website" 
          tabIndex={-1} 
          autoComplete="off" 
          />
        </label>
      </div>

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
            placeholder="Phone number (optional)"
            autoComplete="tel"
          />
        </label>
      </div>

      <fieldset className={styles.types}>
        <legend>Type of enquiry</legend>
        <div className={styles.chips}>
          {ENQUIRY_TYPES.map(({ value, label }, i) => (
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
        <textarea name="message" rows={5} placeholder="Message" required />
      </label>

      {error && (
        <p className={styles.formError} role="alert">
          {error}
        </p>
      )}

      <button type="submit" className={styles.submit} disabled={sending}>
        {sending ? (
          <FaSpinner className={styles.spin} aria-hidden="true" />
        ) : (
          <FaPaperPlane aria-hidden="true" />
        )}
        {sending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
import Link from "next/link";
import { FaShieldAlt, FaArrowRight } from "react-icons/fa";
import styles from "./Legal.module.css";

/* ---------- Edit this ---------- */
const PRIVACY_EMAIL = "your@email.com";
/* -------------------------------- */

export const metadata = {
  title: "Privacy Policy | BeeWell Infant Spa",
  description:
    "How BeeWell Infant Spa collects, uses and protects your personal information and your baby's information, in line with POPIA.",
};

const UPDATED = "13 October 2026";

const sections = [
  {
    heading: "Who we are",
    paragraphs: [
      "BeeWell Infant Spa (“we”, “us”) is the responsible party for the personal information described in this policy. We offer baby massage classes in Douglas and Kimberley, Northern Cape, South Africa.",
      `You can contact us about privacy at ${PRIVACY_EMAIL}.`,
    ],
  },
  {
    heading: "Information we collect",
    list: [
      "About you: your full name, your relationship to the baby, your cellphone number and your email address when you book a class, and your name, email and phone number if you contact us.",
      "About your baby: your baby's full name, date of birth and preferred name.",
      "Health information about your baby: whether your baby has a health condition, allergy or special consideration, the details you give us, and the name and phone number of your baby's doctor or paediatrician if you choose to share them. Health information is special personal information, and information about children receives extra protection under the Protection of Personal Information Act (POPIA).",
      "Your choices: whether you consent to massage oils or lotions being used on your baby, and whether you consent to photos or videos of your baby being used for marketing.",
      "Booking details: the location, class times and dates you book.",
      "Your messages: anything you write to us in the contact form.",
      "Photos or videos of you and your baby, only if you give us your consent.",
    ],
  },
  {
    heading: "Why we use your information",
    list: [
      "To manage your booking and keep your place in a class.",
      "To prepare for your baby's classes and keep them safe, including checking whether we need medical clearance and making sure we do not use products your baby should not have.",
      "To send booking confirmations and reply to your enquiries.",
      "To respond to emergencies and to record incidents.",
      "To administer payments and keep proper records.",
      "To meet our legal obligations.",
      "To use photos or videos for social media, our website or promotion, but only with your separate consent.",
    ],
  },
  {
    heading: "Consent and your choices",
    paragraphs: [
      "Where we rely on your consent, for example for photos and videos, for using products on your baby or for health information about your baby, you can withdraw that consent going forward at any time by contacting us. Withdrawing consent does not affect the lawfulness of how we used your information before you withdrew it.",
      "Because your baby is a child, consent for your baby's information is given by you as their parent or legal guardian. Choosing not to consent to photos or videos does not affect your booking.",
    ],
  },
  {
    heading: "Who sees it and who we share it with",
    paragraphs: [
      "We do not sell your personal information. Your booking details, including the health information you give us, are used by the instructor to run the class and are not shown to other parents.",
      "We use trusted service providers to run our bookings and communication: Google (the calendar we use to schedule classes), Resend (email delivery) and our website hosting provider. They only process information to provide those services.",
      "We may also share information where the law requires it, or with emergency services if there is an emergency involving your baby.",
    ],
  },
  {
    heading: "Storing information outside South Africa",
    paragraphs: [
      "Some of our service providers store or process information on servers outside South Africa. We take reasonable steps to make sure your information stays protected when they handle it.",
    ],
  },
  {
    heading: "Keeping it safe and how long we keep it",
    paragraphs: [
      "We take reasonable technical and organisational steps to protect personal information, and we limit access to people who need it to run our classes.",
      "We keep information only for as long as we need it for the purposes above, or for as long as the law requires, and then we delete it or make it anonymous.",
    ],
  },
  {
    heading: "Your rights",
    list: [
      "Ask what personal information we hold about you and your baby.",
      "Ask us to correct or update information that is wrong or out of date.",
      "Ask us to delete information we no longer need, where the law allows.",
      "Withdraw your consent, or object to how we use your information.",
      "Complain to the Information Regulator (South Africa) at inforegulator.org.za if you believe we have handled your information unlawfully.",
    ],
  },
  {
    heading: "Changes to this policy",
    paragraphs: [
      "We may update this policy from time to time. The latest version is always on this page, with the date it was last updated shown at the top.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>
          <FaShieldAlt aria-hidden="true" /> Your privacy matters
        </p>
        <h1 className={styles.title}>
          Privacy <span className={styles.highlight}>Policy</span>
        </h1>
        <p className={styles.intro}>
          This explains what personal information we collect about you and
          your baby, why we collect it, and how we look after it.
        </p>
        <p className={styles.meta}>Last updated: {UPDATED}</p>
      </header>

      <article className={styles.card}>
        {sections.map((section, i) => (
          <section key={section.heading} className={styles.section}>
            <h2 className={styles.heading}>
              <span className={styles.num}>{i + 1}</span>
              {section.heading}
            </h2>

            {section.paragraphs?.map((p) => (
              <p key={p} className={styles.text}>
                {p}
              </p>
            ))}

            {section.list && (
              <ul className={styles.list}>
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </article>

      <nav className={styles.links} aria-label="Related pages">
        <Link href="/terms" className={styles.linkSecondary}>
          Terms &amp; Conditions
          <FaArrowRight aria-hidden="true" />
        </Link>
        <Link href="/contact" className={styles.linkPrimary}>
          Questions? Contact us
          <FaArrowRight aria-hidden="true" />
        </Link>
      </nav>
    </main>
  );
}
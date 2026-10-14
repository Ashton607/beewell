import Link from "next/link";
import { FaFileContract, FaArrowRight } from "react-icons/fa";
import styles from "../privacy/Legal.module.css";



const UPDATED = "13 October 2026";

const sections = [
  {
    heading: "About our classes",
    paragraphs: [
      "BeeWell Infant Spa offers baby massage instruction and gentle infant wellness activities. Our classes aim to encourage positive touch, relaxation, bonding and parent-baby connection.",
      "Our classes are not medical treatment and are not a substitute for medical diagnosis, medical advice, physiotherapy, occupational therapy or other healthcare services. If you have any concerns about your baby's health or development, please speak to your doctor or healthcare provider.",
    ],
  },
  {
    heading: "Bookings and your place",
    list: [
      "A booking is for 5 weekly classes at the same time every week: Fridays in Douglas (8:00 am, 10:00 am or 4:30 pm) or Saturdays in Kimberley (10:00 am).",
      "Each class group is made up of a maximum of 5 parents, so everyone gets individual attention.",
      "Once you choose a time, your place is reserved at that time for all 5 weeks.",
      "The fee is R1000 for the 5 classes.",
    ],
  },
  {
    heading: "Your responsibilities",
    list: [
      "You are the parent or legal guardian of the baby you are booking for, or you have proper authority to give consent on the baby's behalf.",
      "You stay responsible for your baby's care and supervision throughout every class, and you will not leave your baby unattended.",
      "You will follow reasonable safety and hygiene instructions from the facilitator.",
      "You will make sure we can reach you during class, and you will tell us promptly if your baby's health or circumstances change.",
    ],
  },
  {
    heading: "Health and wellbeing",
    paragraphs: [
      "When you book, we ask for your baby's name and date of birth and whether your baby has a health condition, allergy or special consideration. If so, we ask you to describe it and, if you wish, to give us the name and number of your baby's doctor or paediatrician.",
      "By booking, you confirm that the information you give us is complete and accurate to the best of your knowledge. If you are not sure whether something is relevant, tell us and we will talk it through with you.",
      "Where a medical condition, injury, illness, medication or other concern could reasonably affect safety, we may ask for written medical clearance from a healthcare professional before your baby takes part. We may postpone or adjust participation until we have the information or clearance we need.",
    ],
  },
  {
    heading: "Your baby's cues and comfort",
    list: [
      "Babies can become tired, hungry, distressed, overstimulated or uncomfortable during a class.",
      "Your baby's cues and wellbeing always come first. Babies are never forced to take part in an activity.",
      "You can stop any activity involving your baby at any time, and please tell the facilitator if your baby is uncomfortable or you have a concern.",
      "We may stop, change or leave out an activity if we reasonably believe that continuing is not right for your baby's comfort or safety.",
    ],
  },
  {
    heading: "Oils, lotions and allergies",
    paragraphs: [
      "On the booking form you choose whether you consent to approved massage oils or lotions being used on your baby. The box starts empty, and you only tick it if you agree. If you do not tick it, we will not use any product on your baby.",
      "Please tell us about any known allergies or sensitivities. If you notice redness, irritation, swelling, breathing difficulty or any other unexpected reaction, tell us straight away. We will stop the activity or product and get appropriate help where reasonably necessary.",
    ],
  },
  {
    heading: "Illness and attendance",
    paragraphs: [
      "To keep babies, parents and facilitators healthy, please do not bring your baby to a class if your baby has a fever, vomiting, diarrhoea, a contagious illness, significant respiratory symptoms, an unexplained rash, or any other condition that could reasonably put others at risk.",
      "We may ask a participant to postpone or leave a class if we reasonably believe that attending is a health or safety concern. Any rescheduling or make-up arrangements are subject to the payment, cancellation and rescheduling terms below.",
    ],
  },
  {
    heading: "Risks of taking part",
    paragraphs: [
      "Even when reasonable care is taken, baby massage and infant wellness classes carry foreseeable risks. These include temporary discomfort, crying or distress, overstimulation, skin irritation or an allergic reaction to a product, accidental bumps, slips or falls, and the aggravation of an existing condition.",
      "Every baby is an individual and no class can guarantee a particular outcome. Benefits can differ from one baby to the next.",
    ],
  },
  {
    heading: "Our care and your acknowledgement",
    paragraphs: [
      "We will take reasonable steps appropriate to our classes to provide a safe environment and to run activities with reasonable care. Taking part also carries inherent risks that cannot always be completely removed.",
      "By booking, you confirm that you have had the chance to read and understand the nature of the classes and the risks described in these terms before your baby takes part. To the extent permitted by law, you accept the ordinary and inherent risks of your baby's voluntary participation.",
      "Nothing in these terms excludes, restricts or waives any right or liability that cannot lawfully be excluded, restricted or waived, including your rights under South African consumer law.",
    ],
  },
  {
    heading: "Emergencies and incident records",
    paragraphs: [
      "If an emergency happens, we will take reasonable steps appropriate to the situation. This may include stopping the activity, contacting you, and getting emergency medical help.",
      "If we cannot reach you in time, you authorise us, where reasonably necessary, to contact emergency services or arrange appropriate emergency medical assistance for your baby.",
      "We may record relevant details of an incident involving your baby for safety, administrative, insurance or legal purposes. These records are handled as described in our Privacy Policy.",
    ],
  },
  {
    heading: "Payment, cancellation and rescheduling",
    paragraphs: [
      "The class fee is R1000 for 5 classes.",
      "[Cancellation, refund, missed class and rescheduling policy: to be completed by BeeWell Infant Spa before this page is published.]",
    ],
  },
  {
    heading: "Photos and videos",
    paragraphs: [
      "We only use photos or videos of your baby on social media, on our website or for promotion if you tick the separate, optional photo and video consent box on the booking form. The box starts empty, and leaving it empty does not affect your booking in any way.",
      "You can withdraw your consent going forward at any time by contacting us. This does not affect how a photo or video was lawfully used before you withdrew your consent.",
    ],
  },
  {
    heading: "Changes to these terms",
    paragraphs: [
      "We may update these terms from time to time. The latest version is always on this page, with the date it was last updated shown at the top.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>
          <FaFileContract aria-hidden="true" /> Please read before booking
        </p>
        <h1 className={styles.title}>
          Terms &amp; <span className={styles.highlight}>Conditions</span>
        </h1>
        <p className={styles.intro}>
          These terms explain how our baby massage classes work and what we
          ask of parents, so every class is safe, calm and enjoyable.
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
        <Link href="/privacy" className={styles.linkSecondary}>
          Privacy Policy
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
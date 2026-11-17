import type { Metadata } from "next";
import { Prose } from "../../components/Shell";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach Enrych: report bugs, suggest features or ask a question about Initle, Toppings or Verse.",
};

const ISSUES = [
  ["Initle", "https://github.com/enrych/initle/issues"],
  ["Toppings", "https://github.com/enrych/toppings/issues"],
  ["Verse", "https://github.com/enrych/verse/issues"],
];

export default function Contact() {
  return (
    <Prose>
      <h1>Contact</h1>
      <p className="lead">The quickest way to reach us is through GitHub, where every report is read and answered.</p>

      <h2>Bugs and feature ideas</h2>
      <p>Open an issue on the project&apos;s page. A screenshot and the steps that led to the problem help a lot.</p>
      <ul>
        {ISSUES.map(([name, href]) => (
          <li key={name}>
            <a href={href} target="_blank" rel="noopener noreferrer">
              {name} issues
            </a>
          </li>
        ))}
      </ul>

      <h2>Anything else</h2>
      <p>
        For questions about privacy, removing data, or anything that isn&apos;t a bug, open an issue on any of the projects above, or reach out through the{" "}
        <a href="https://github.com/enrych" target="_blank" rel="noopener noreferrer">
          Enrych GitHub profile
        </a>
        .
      </p>
    </Prose>
  );
}

import Image from "next/image";

export function BuildHero({
  eyebrow,
  title,
  description,
  art = "mountain",
}: {
  eyebrow: string;
  title: string;
  description: string;
  art?: "mountain" | "lighthouse";
}) {
  return (
    <section className="journey-hero">
      <Image
        src={
          art === "lighthouse"
            ? "/stage26/discover-lighthouse.svg"
            : "/stage26/mission-mountain.svg"
        }
        alt=""
        width={480}
        height={360}
        className="journey-hero-art"
        priority
      />
      <div className="journey-hero-copy">
        <p className="journey-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="journey-hero-description">{description}</p>
      </div>
    </section>
  );
}

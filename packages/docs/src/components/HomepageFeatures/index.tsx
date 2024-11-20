import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<"svg">>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: "Real-Time Analytics",
    Svg: require("@site/static/img/undraw_docusaurus_mountain.svg").default, // Replace with a relevant SVG for analytics
    description: (
      <>
        Track your website's activity in real-time, including page views,
        sessions, referrers, and more.
      </>
    ),
  },
  {
    title: "Discord Integration",
    Svg: require("@site/static/img/undraw_docusaurus_tree.svg").default, // Replace with a relevant SVG for Discord integration
    description: (
      <>
        Get instant updates and alerts about your website performance directly
        in your Discord server.
      </>
    ),
  },
  {
    title: "Self-Hosting",
    Svg: require("@site/static/img/undraw_docusaurus_react.svg").default, // Replace with a relevant SVG for self-hosting
    description: (
      <>
        Host StatStream on your own infrastructure for complete data control and
        privacy.
      </>
    ),
  },
];
function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

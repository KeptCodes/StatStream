import React from "react";
import Link from "@docusaurus/Link";
import clsx from "clsx";
import HomepageFeatures from "./HomepageFeatures";

const LandingPage = () => {
  return (
    <main>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-teal-600 text-white text-center py-24 dark:from-teal-600 dark:to-teal-500 dark:text-gray-900">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
            Welcome to <span className="text-teal-200">StatStream</span>
          </h1>
          <p className="mt-4 text-lg sm:text-xl md:text-2xl">
            Real-time Website Analytics & Discord Integration
          </p>
          <div className="mt-8 flex justify-center gap-6">
            <Link
              className="button button--secondary button--lg"
              to="/docs/intro"
            >
              Get Started
            </Link>
            <Link
              to="/docs/why-to-use"
              className="button button--primary button--lg"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white text-center dark:bg-gray-800 dark:text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-12 dark:text-white">
            Key Features
          </h2>
          <HomepageFeatures />
        </div>
      </section>

      {/* About Section */}
      <section className="bg-teal-600 text-white py-20 dark:bg-teal-700">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold mb-6">About StatStream</h2>
          <p className="text-lg sm:text-xl">
            StatStream is a powerful analytics tool that lets you track website
            activity and send real-time updates to your Discord server.
          </p>
        </div>
      </section>

      {/* GitHub Stars Section */}
      <section className="py-20 bg-gray-100 text-center dark:bg-gray-800 dark:text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-6 dark:text-white">
            Support StatStream
          </h2>
          <p className="text-lg mb-4 dark:text-gray-400">
            If you like StatStream, star us on GitHub!
          </p>
          <a
            href="https://github.com/keptcodes/statstream"
            className="button button--primary button--lg"
          >
            ⭐ Star on GitHub
          </a>
        </div>
      </section>

      {/* Contribution Section */}
      <section className="py-20 bg-white text-center dark:bg-gray-800 dark:text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-6 dark:text-white">
            Contribute to StatStream
          </h2>
          <p className="text-lg sm:text-xl mb-8 dark:text-gray-400">
            We welcome contributions! Join the StatStream community and help
            make the project even better.
          </p>
          <a
            href="https://github.com/keptcodes/statstream"
            target="_blank"
            className="button button--primary button--lg"
          >
            Contribute on GitHub
          </a>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;

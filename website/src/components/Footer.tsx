import { formatTimeAgo } from "@/utils/dateFormat";
import Link from "next/link";
import { useEffect, useState } from "react";

export const Footer = ({ pricesLastUpdated }: { pricesLastUpdated?: Date }) => {
  // Re-render every second to update the relative date
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setCount(count + 1), 1000);
    return () => clearInterval(interval);
  });

  return (
    <footer className="mb-24">
      <p>
        Each item&apos;s expected value is calculated based on its drop chance
        multiplied by its profit. The sum of all profitable items&apos; expected
        values creates a loot chest&apos;s average expected value per run.
      </p>
      <p>
        Expected value after rerolling is calculated by subtracting the value of
        a kismet feather from the expected value of the chest.
      </p>
      <p>
        The mechanics behind chest loot are not completely known, so the
        expected value is only an rough estimate. It also does not take RNG
        meter into account.
      </p>
      <p>
        {pricesLastUpdated ? (
          <>
            Prices last updated{" "}
            <span title={pricesLastUpdated.toLocaleString()}>
              {formatTimeAgo(pricesLastUpdated)}
            </span>
            .
          </>
        ) : null}{" "}
        Data sourced from{" "}
        <Link href="https://github.com/Tricked-dev/lowestbins">
          Tricked&apos;s <code>lowestbins</code>
        </Link>
        .
      </p>
      <p>
        Drop chances sourced from the{" "}
        <Link href="https://wiki.hypixel.net/Main_Page">
          Hypixel SkyBlock Wiki
        </Link>
        .
      </p>
      <p className="mt-8">
        <Link
          className="inline-flex items-center gap-2 text-gray-400"
          href="https://github.com/HichamIDDIR/dungeon-loot-calculator"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            aria-hidden="true"
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
          Source code on GitHub
        </Link>
      </p>
    </footer>
  );
};

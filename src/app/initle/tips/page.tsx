import type { Metadata } from "next";
import Link from "next/link";
import { Prose } from "../../../components/Shell";

export const metadata: Metadata = {
  title: "Initle tips: how to crack initials faster",
  description: "Practical strategies for Initle: reading initials, using word lengths, making partial guesses count, and writing fakes that fool your friends.",
};

export default function Tips() {
  return (
    <Prose>
      <h1>Tips for cracking initials faster</h1>
      <p className="lead">
        Initle rewards speed, but the best players aren&apos;t just quick. They have a few habits that let them narrow down a string of letters before the clues arrive.
        Here are the ones that help most.
      </p>

      <h2>Reading the initials</h2>
      <h3>Look for the little words first</h3>
      <p>
        English phrases lean heavily on a handful of short words: <em>the</em>, <em>a</em>, <em>of</em>, <em>in</em>, <em>to</em>, <em>and</em>. When you see
        T, A, O or I in the middle of a string, assume it&apos;s one of those. <strong>A · P · I · T · H</strong> becomes “a ___ in the ___”, and from there “a penny in
        the hand” or “a bird in the hand” starts to suggest itself.
      </p>
      <h3>Use the pack name</h3>
      <p>
        The pack is shown under the board. The same letters mean very different things in Movies and in Idioms. <strong>T · G · F</strong> in a movie pack is almost
        certainly “The Godfather”; in idioms, think again.
      </p>
      <h3>Count the words</h3>
      <p>
        Two- and three-word puzzles are usually titles. Five words or more are usually sayings or quotes, because titles rarely run that long. That one observation cuts
        your search in half.
      </p>

      <h2>Using the clues as they arrive</h2>
      <h3>Word lengths are a gift</h3>
      <p>
        At stage two you see how long each word is. A three-letter word starting with T is <em>the</em> nine times out of ten. A long word that starts with an
        uncommon letter often unlocks the whole phrase on its own.
      </p>
      <h3>Guess the parts you&apos;re sure of</h3>
      <p>
        You don&apos;t have to know the whole answer. Type just the words you&apos;re confident about. Each correct word locks in green, earns points even if you never
        finish, and makes the rest easier to see. Many solves happen right after someone types two words they were sure of.
      </p>
      <h3>Don&apos;t wait for the hint if you have a hunch</h3>
      <p>
        Each stage is worth 100 points less than the one before. A wrong guess costs you nothing in Crack it rounds, so a reasonable guess at stage one is almost always
        worth making.
      </p>

      <h2>Winning Fake it rounds</h2>
      <h3>Match the genre</h3>
      <p>
        The best fakes sound like they belong in the same pack as the real answer. In a movie round, write something that sounds like a film title; in idioms, write
        something that sounds like advice your grandmother would give.
      </p>
      <h3>Be boring on purpose</h3>
      <p>
        Funny fakes get laughs but rarely get votes. A fake that sounds plausible and slightly dull is far more likely to be mistaken for the real thing, and every vote
        it gets is 150 points.
      </p>
      <h3>Vote with suspicion</h3>
      <p>
        The real answer is a phrase you&apos;ve probably heard before. If one option makes you think “oh, I know that one”, it&apos;s often real. If an option is
        suspiciously clever, a friend probably wrote it.
      </p>

      <h2>For the Daily</h2>
      <ul>
        <li>Use your first guess even if you&apos;re unsure: every miss reveals more, and words you get right stay locked.</li>
        <li>Pay attention to the pack; the Daily rotates through all of them.</li>
        <li>Play at the same time each day. Streaks are easier to keep when the Daily is part of a routine.</li>
      </ul>

      <p>
        Put it into practice: try <a href="https://initle.enry.ch/daily">today&apos;s Daily</a>, or read the <Link href="/initle/how-to-play">full rules</Link>.
      </p>
    </Prose>
  );
}

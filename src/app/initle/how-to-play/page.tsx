import type { Metadata } from "next";
import Link from "next/link";
import { Prose } from "../../../components/Shell";

export const metadata: Metadata = {
  title: "How to play Initle: rules and scoring",
  description:
    "The complete rules of Initle: how reveal stages work, how Crack it and Fake it rounds are scored, how the Daily works, and how to host a game on a TV.",
};

export default function HowToPlay() {
  return (
    <Prose>
      <h1>How to play Initle</h1>
      <p className="lead">The full rules, from starting a room to the last round. Reading this takes about four minutes; learning by playing takes one round.</p>

      <h2>1. Start a game</h2>
      <ol>
        <li>
          Open <a href="https://initle.enry.ch">initle.enry.ch</a> on your phone. A random nickname is filled in for you; change it if you like and pick an avatar.
        </li>
        <li>
          Tap <strong>Create a room</strong>. You&apos;re now the host, and the room has a four-letter code such as <em>KMQR</em>.
        </li>
        <li>Friends open the same site and type the code, or scan the QR code on your screen. Between 2 and 10 people can play.</li>
        <li>
          Optional: open <em>initle.enry.ch/stage/CODE</em> on a TV or laptop. That screen shows the board in big letters for the whole room, while phones stay as
          controllers.
        </li>
        <li>
          Choose the number of rounds (5, 8 or 12 are common), the puzzle packs, which round types to include and how fast clues appear. Then tap{" "}
          <strong>Start game</strong>.
        </li>
      </ol>

      <h2>2. Crack it rounds</h2>
      <p>Each puzzle is shown as its initials only. Every few seconds (the host picks the speed) the board reveals more, in five stages:</p>
      <ol>
        <li>Initials only, e.g. P · O · C.</li>
        <li>How many letters each word has.</li>
        <li>A short hint, such as “Something very easy”.</li>
        <li>Some letters inside the words.</li>
        <li>More letters, until the phrase is almost spelled out.</li>
      </ol>
      <p>
        Type guesses whenever you like. You don&apos;t need the whole phrase at once: any word you get right locks in green on your screen, and the rest of the phrase stays
        hidden from you until you crack it. Capital letters and punctuation are ignored, and a small typo in a longer word is forgiven.
      </p>
      <h3>Scoring</h3>
      <table>
        <thead>
          <tr>
            <th>Solved at stage</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {[
            [1, 500],
            [2, 400],
            [3, 300],
            [4, 200],
            [5, 100],
          ].map(([s, p]) => (
            <tr key={s}>
              <td>Stage {s}</td>
              <td>{p}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul>
        <li>The first person to solve gets a +50 bonus.</li>
        <li>If you don&apos;t finish, you still get 20 points for every word you locked in.</li>
        <li>The final round of the game counts double.</li>
      </ul>

      <h2>3. Fake it rounds</h2>
      <p>
        Fake it turns the game around. You see the initials of a real phrase, but instead of guessing, you invent a phrase that fits the same letters. For{" "}
        <em>P · O · C</em> you might write “Pizza Or Crumble”.
      </p>
      <ol>
        <li>Everyone writes one fake before the timer runs out.</li>
        <li>All the fakes and the real phrase are shown together, in the same style so the real one doesn&apos;t stand out.</li>
        <li>Everyone votes for the one they think is real. You can&apos;t vote for your own.</li>
      </ol>
      <ul>
        <li>+300 points if you pick the real phrase.</li>
        <li>+150 points for every player who votes for your fake.</li>
      </ul>
      <p>If two people write the same fake, they share it, and both score when it fools someone.</p>

      <h2>4. Between rounds</h2>
      <p>
        After each round, everyone sees the answer and how many points each player earned, then the scoreboard. The host can pause the game, skip a round, change
        settings for the rounds still to come, or move things along with <strong>Next</strong> if the room is ready. If someone&apos;s phone locks or they lose signal,
        they can rejoin with the same link and keep their score.
      </p>
      <p>At the end, the podium shows the top three and awards like Best Bluffer, Lie Detector and Quickest Draw. Tap Play again to start a new game with the same room.</p>

      <h2>5. The Daily puzzle</h2>
      <p>
        Every day at midnight UTC (5:30 am in India) a new puzzle appears at <a href="https://initle.enry.ch/daily">initle.enry.ch/daily</a>. It&apos;s the same for everyone. You
        get five guesses, and every miss reveals the next stage. When you finish, you can share a spoiler-free grid like this:
      </p>
      <pre className="rounded-lg bg-black/50 p-4 text-white">Initle #17 · 2/5{"\n"}🟧🟩⬛⬛⬛</pre>
      <p>
        Solve on consecutive days to build a streak. Add friends to see their results next to yours, or check the global leaderboard to see how you rank today.
      </p>

      <h2>Common questions</h2>
      <h3>Do I need an account?</h3>
      <p>No. You only pick a nickname. If you want to keep your friends and streak on another phone, you can save a passkey or a recovery code.</p>
      <h3>Is it suitable for families?</h3>
      <p>Yes. Hosts can turn on Family mode, which filters out rude phrases in custom packs and player-written fakes.</p>
      <h3>Can I make my own puzzles?</h3>
      <p>
        Yes. Paste a list of phrases at <a href="https://initle.enry.ch/packs/new">initle.enry.ch/packs/new</a>, one per line, and share the link with your group.
      </p>

      <p>
        Ready? <a href="https://initle.enry.ch">Start a game</a>, or read some <Link href="/initle/tips">tips for cracking puzzles faster</Link>.
      </p>
    </Prose>
  );
}

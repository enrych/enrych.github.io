import type { Metadata } from "next";
import Link from "next/link";
import { Prose } from "../../components/Shell";

export const metadata: Metadata = {
  title: "Initle: the party game of initials",
  description:
    "Initle is a free party game for 2 to 10 players. Crack famous phrases from their initials, write fakes that fool your friends, and play a new Daily puzzle every day.",
};

export default function InitlePage() {
  return (
    <Prose>
      <h1>Initle: the party game of initials</h1>
      <p className="lead">
        One line of letters. A famous phrase hiding behind it. Who in the room cracks it first? Initle is a free party game for 2 to 10 friends that runs in any phone
        browser. There&apos;s nothing to install and no account to make.
      </p>
      <p>
        <a href="https://initle.enry.ch">Play Initle now</a> · <Link href="/initle/how-to-play">How to play</Link> · <Link href="/initle/tips">Tips and strategy</Link>
      </p>

      <h2>The idea</h2>
      <p>
        Every puzzle is a phrase you already know: an idiom, a movie title, a song, a famous quote or a landmark. You only see its first letters. <strong>B · L · T · N</strong>{" "}
        is easy if you think of sayings (“better late than never”), but the same four letters could be a film you half remember. The longer you wait, the more Initle
        reveals: first how long each word is, then a hint, then letters one by one. Solve early and you score big; wait for the clues and you score less.
      </p>

      <h2>Three ways to play</h2>
      <h3>Party mode</h3>
      <p>
        One person creates a room and everyone joins with a four-letter code or a link. Phones become controllers, and you can put the{" "}
        <em>stage screen</em> on a TV or laptop so the whole room sees the board. Rounds alternate between two types:
      </p>
      <ul>
        <li>
          <strong>Crack it.</strong> Everyone races to guess the phrase while the clues appear. Words you get right lock in green on your screen, so a half-right guess still
          earns points.
        </li>
        <li>
          <strong>Fake it.</strong> Everyone writes a believable fake that fits the letters. Then the fakes and the real answer are shuffled together and everyone votes for
          the one they think is real. You score for spotting the real one and for every friend your fake fools.
        </li>
      </ul>
      <h3>Daily</h3>
      <p>
        One puzzle a day, the same for everyone, with five guesses. Share your result as a little grid of coloured squares, keep a streak going, and compare scores with
        friends on the leaderboard.
      </p>
      <h3>Solo</h3>
      <p>Endless puzzles at your own pace, from whichever packs you like. Good practice before game night.</p>

      <h2>Puzzle packs</h2>
      <p>Hosts pick which packs to play from, and anyone can paste their own list of phrases to make a custom pack and share it as a link.</p>
      <table>
        <thead>
          <tr>
            <th>Pack</th>
            <th>What&apos;s inside</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["Idioms & Sayings", "Everyday expressions. The best place to start."],
            ["Movies", "Hollywood classics and modern hits."],
            ["TV Shows", "Binge-worthy series from the last few decades."],
            ["Songs", "Anthems and earworms."],
            ["Books", "Classics and bestsellers."],
            ["Bollywood", "Hindi cinema favourites."],
            ["Famous Quotes", "Lines everyone has heard somewhere."],
            ["Places & Landmarks", "Wonders of the world, described by their names."],
          ].map(([n, d]) => (
            <tr key={n}>
              <td>{n}</td>
              <td>{d}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Friends and leaderboards</h2>
      <p>
        Every player gets a friend code and an invite link. Add friends and you&apos;ll see how each of them did on today&apos;s Daily, along with their streaks. A global
        leaderboard ranks everyone who finished today&apos;s puzzle by fewest guesses, then speed. If you&apos;d rather stay off the global board, one switch hides you;
        friends still see your results. A passkey or recovery code keeps your friends and streak with you when you change phones.
      </p>

      <h2>Why we made it</h2>
      <p>
        Most party games need everyone to install the same app, or they only work if one person owns a console. Initle runs in the browser of whatever phone people
        already have, on Wi-Fi or mobile data, and a game takes about ten minutes. It&apos;s also built to be fair to the person who joins halfway through: they can jump
        straight into the next round.
      </p>

      <h2>Privacy and ads</h2>
      <p>
        Initle doesn&apos;t ask for your email or real name. Party rooms are deleted a few hours after the game ends. Solo mode may show ads to keep the game free; party
        rooms and the TV screen never do. The full details are in{" "}
        <a href="https://initle.enry.ch/privacy">Initle&apos;s privacy policy</a>.
      </p>
    </Prose>
  );
}

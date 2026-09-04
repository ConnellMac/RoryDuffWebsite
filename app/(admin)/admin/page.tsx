import Link from "next/link";
export default function Page() {
  return (
    <article>
      <h1>Administration</h1>
      <nav aria-label="Administration sections">
        <ul>
          <li>
            <Link href="/admin/sacred-sites">Sacred Sites</Link>
          </li>
          <li>
            <Link href="/admin/cohorts">Cohorts</Link>
          </li>
        </ul>
      </nav>
    </article>
  );
}

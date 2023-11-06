import { useState, useRef } from "react";
import { Form, useFetcher } from "react-router-dom";
import "./home.css";

const repos = [
  "mozilla-central",
  "try",
  "mozilla-beta",
  "mozilla-release",
  "autoland",
  "fenix",
];

const frameworkMap = {
  1: "talos",
  2: "build_metrics",
  4: "awsy",
  6: "platform_microbench",
  10: "raptor",
  11: "js-bench",
  12: "devtools",
  13: "browsertime",
  15: "mozperftest",
  16: "fxrecord",
};

function RepositorySelect({ name, id, repository, onRepoChange }) {
  return (
    <>
      <label htmlFor={id ?? name}>Repository</label>
      <select
        name={name}
        id={id ?? name}
        value={repository}
        onChange={(e) => onRepoChange(e.currentTarget.value)}
      >
        {repos.map((repo) => (
          <option key={repo} value={repo}>
            {repo}
          </option>
        ))}
      </select>
    </>
  );
}

function FrameworkSelect() {
  return (
    <select name="framework">
      {Object.entries(frameworkMap).map(([key, name]) => (
        <option key={key} value={key}>
          {name}
        </option>
      ))}
    </select>
  );
}

function RevisionSelector({
  allRecentRevisions,
  maxRev,
  selectedRevisions,
  onChangeSelectedRevisions,
}) {
  return allRecentRevisions ? (
    <ul>
      {allRecentRevisions.map((revision) => {
        const {
          repository_id,
          id,
          revisions,
          revision: hash,
          author,
        } = revision;
        const isTry = repository_id === 4;
        const lastUsefulRevision =
          isTry && revisions.length > 1 ? revisions[1] : revisions[0];
        const lastUsefulSummary = lastUsefulRevision.comments.slice(
          0,
          lastUsefulRevision.comments.indexOf("\n"),
        );
        return (
          <li key={id}>
            {author} - {hash.slice(0, 7)} - {lastUsefulSummary}
          </li>
        );
      })}
    </ul>
  ) : (
    <div>Loading...</div>
  );
}

const emailMatch = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const hashMatch = /\b[a-f0-9]+\b/;

// Type is "base" or "new", only used to derive classes and ids
// MaxRev is >= 1, maximum number of values that can be added.
function RevisionSelectForm({ type, maxRev }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [repository, setRepository] = useState("mozilla-central");
  const [isDropdownDisplayed, setIsDropdownDisplayed] = useState(false);
  const [selectedRevisions, setSelectedRevisions] = useState([]);

  const fetcher = useFetcher();
  const TIMEOUT = 500;

  const idleTimeoutRef = useRef(null);

  function loadRecentRevisions() {
    let apiUrl = `/api/recent-revisions/${repository}`;

    if (emailMatch.test(searchTerm)) {
      apiUrl += "/by-author/" + encodeURIComponent(searchTerm);
    } else if (hashMatch.test(searchTerm)) {
      apiUrl += "/by-hash/" + encodeURIComponent(searchTerm);
    } else if (searchTerm) {
      // This is an error case, display an error.
      console.error(`${searchTerm} isn't correct, try again.`);
      return;
    }

    fetcher.load(apiUrl);
  }

  function onIdleTimeout() {
    idleTimeoutRef.current = null;
    loadRecentRevisions();
  }

  function onSearchTermChange(e) {
    setSearchTerm(e.currentTarget.value);
    clearTimeout(idleTimeoutRef.current);
    idleTimeoutRef.current = setTimeout(onIdleTimeout, TIMEOUT);
  }

  function onInputFocus() {
    setIsDropdownDisplayed(true);
    loadRecentRevisions();
  }

  function onInputBlur() {
    setIsDropdownDisplayed(false);
  }

  function onInputKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault(); // Avoid submitting the form
      loadRecentRevisions();
    }
  }

  const inputId = type + "Rev";

  return (
    <div>
      <RepositorySelect
        name={type + "Repo"}
        repository={repository}
        onRepoChange={(repo) => setRepository(repo)}
      />
      <label htmlFor={inputId}>Base revision</label>
      <input
        type="text"
        id={inputId}
        value={searchTerm}
        onChange={onSearchTermChange}
        onFocus={onInputFocus}
        onBlur={onInputBlur}
        onKeyDown={onInputKeyDown}
      />
      {isDropdownDisplayed ? (
        <RevisionSelector
          maxRev={maxRev}
          allRecentRevisions={fetcher.data}
          selectedRevisions={selectedRevisions}
          onChangeSelectedRevisions={setSelectedRevisions}
        />
      ) : null}
    </div>
  );
}

export function Home() {
  return (
    <Form action="/compare-results" className="compare-results-form">
      <RevisionSelectForm type="base" maxRev={1} />
      <RevisionSelectForm type="new" maxRev={3} />
      <div>
        <FrameworkSelect />
      </div>
      <div>
        <button>Compare</button>
      </div>
    </Form>
  );
}

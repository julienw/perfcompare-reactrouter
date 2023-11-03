import { useState } from "react";
import { Form } from "react-router-dom";
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

function RepositorySelect({ name, id }) {
  return (
    <>
      <label htmlFor={id ?? name}>Repository</label>
      <select name={name} id={id ?? name}>
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

export function Home() {
  const [newRevCount, setNewRevCount] = useState(1);
  const incRevCount = () => setNewRevCount((state) => state + 1);
  const decRevCount = () => setNewRevCount((state) => state - 1);
  return (
    <Form action="/compare-results" className="compare-results-form">
      <div>
        <RepositorySelect name="baseRepo" />
        <label htmlFor="baseRev">Base revision</label>
        <input type="text" name="baseRev" id="baseRev" />
      </div>
      {Array.from({ length: newRevCount }).map((_, i) => (
        <div key={i}>
          <RepositorySelect name="newRepo" id={`newRepo${i}`} />
          <label htmlFor={`newRev${i}`}>New revision</label>
          <input type="text" name="newRev" id={`newRev${i}`} />
          <button type="button" onClick={incRevCount}>
            +
          </button>
          {i > 0 ? (
            <button type="button" onClick={decRevCount}>
              -
            </button>
          ) : null}
        </div>
      ))}
      <div>
        <FrameworkSelect />
      </div>
      <div>
        <button>Compare</button>
      </div>
    </Form>
  );
}

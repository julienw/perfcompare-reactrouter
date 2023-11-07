import { useLoaderData } from "react-router-dom";

export const treeherderBaseURL = "https://treeherder.mozilla.org";

async function fetchResultsOnTreeherder({
  baseRev,
  baseRepo,
  newRev,
  newRepo,
  framework,
}) {
  const searchParams = new URLSearchParams({
    base_repository: baseRepo,
    base_revision: baseRev,
    new_repository: newRepo,
    new_revision: newRev,
    framework,
    interval: "86400",
    no_subtests: "true",
  });

  const response = await fetch(
    `${treeherderBaseURL}/api/perfcompare/results/?${searchParams.toString()}`,
  );
  if (!response.ok) {
    if (response.status === 400) {
      throw new Error(
        `Error when requesting treeherder: ${await response.text()}`,
      );
    } else {
      throw new Error(
        `Error when requesting treeherder: (${response.status}) ${response.statusText}`,
      );
    }
  }

  return response.json();
}

export async function loader({ request }) {
  let url = new URL(request.url);
  const baseRev = url.searchParams.get("baseRev");
  const baseRepo = url.searchParams.get("baseRepo");
  const newRevs = url.searchParams.getAll("newRev");
  const newRepo = url.searchParams.get("newRepo");
  const framework = url.searchParams.get("framework");

  const promises = [];
  if (newRevs.length) {
    for (let i = 0; i < newRevs.length; i++) {
      promises.push(
        fetchResultsOnTreeherder({
          baseRev,
          baseRepo,
          newRev: newRevs[i],
          newRepo,
          framework,
        }),
      );
    }
  } else {
    promises.push(
      fetchResultsOnTreeherder({
        baseRev,
        baseRepo,
        newRev: baseRev,
        newRepo: baseRepo,
        framework,
      }),
    );
  }

  const resultsForAllRevs = await Promise.all(promises);

  // group by suite

  const resultsGroupedBySuite = resultsForAllRevs.map((resultsForOneRev) =>
    Object.groupBy(resultsForOneRev, (item) => item.suite),
  );

  // Now merge all results
  const results = { ...resultsGroupedBySuite[0] };
  for (let i = 1; i < resultsGroupedBySuite.length; i++) {
    for (const suite of Object.keys(resultsGroupedBySuite[i])) {
      if (!results[suite]) {
        results[suite] = [];
      }
      results[suite].push(...resultsGroupedBySuite[i][suite]);
    }
  }

  return results;
}

export function CompareResults() {
  const results = useLoaderData();

  return (
    <div>
      {Object.entries(results).map(([suite, resultsBySuite]) => (
        <div key={suite} className="suite-group">
          <h2>{suite}</h2>
          {resultsBySuite.map((result, i) => (
            <div key={i}>
              base: {result.base_rev}, new: {result.new_rev}, suite:{" "}
              {result.suite} ({result.platform})
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

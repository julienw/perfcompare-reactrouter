export const treeherderBaseURL = "https://treeherder.mozilla.org";

const emailMatch = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const hashMatch = /\b[a-f0-9]+\b/;

function computeUrlFromSearchTermAndRepository(searchTerm, repository) {
  const baseUrl = `${treeherderBaseURL}/api/project/${repository}/push/`;

  if (!searchTerm) {
    return baseUrl + "?hide_reviewbot_pushes=true";
  }

  if (emailMatch.test(searchTerm)) {
    return baseUrl + "?author=" + encodeURIComponent(searchTerm);
  }

  if (emailMatch.test(hashMatch)) {
    return baseUrl + "?revision=" + searchTerm;
  }

  throw new Error(`Invalid search term ${searchTerm}`);
}
async function fetchRecentRevisionsOnTreeherder({ searchTerm, repository }) {
  const url = computeUrlFromSearchTermAndRepository(searchTerm, repository);
  const response = await fetch(url);

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

  const json = await response.json();
  if (!json.results.length) {
    throw new Error(`Error when requesting treeherder: no results found.`);
  }
  return json.results;
}

export async function loader({ params }) {
  const { searchTerm, repository } = params;
  return await fetchRecentRevisionsOnTreeherder({ searchTerm, repository });
}

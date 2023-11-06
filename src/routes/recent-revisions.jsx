export const treeherderBaseURL = "https://treeherder.mozilla.org";

function computeUrlFromSearchTermAndRepository({ repository, hash, author }) {
  const baseUrl = `${treeherderBaseURL}/api/project/${repository}/push/`;

  if (author) {
    return baseUrl + "?author=" + encodeURIComponent(author);
  }

  if (hash) {
    return baseUrl + "?revision=" + hash;
  }

  return baseUrl + "?hide_reviewbot_pushes=true";
}

async function fetchRecentRevisionsOnTreeherder(params) {
  const url = computeUrlFromSearchTermAndRepository(params);
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
  return json.results;
}

export async function loader({ params }) {
  return await fetchRecentRevisionsOnTreeherder(params);
}

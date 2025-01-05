export const getNodeFetch = () => {
  const nodeFetch = globalThis.fetch ? globalThis.fetch : require('node-fetch');
  const fetchCookie = globalThis.fetchCookie ? globalThis.fetchCookie : require('fetch-cookie').default;
  const fetch = fetchCookie(nodeFetch);
  return {
    fetch,
  };
};

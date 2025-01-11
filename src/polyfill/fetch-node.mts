export const getNodeFetch = () => {
  const nodeFetch = globalThis.fetch ? globalThis.fetch : require('node-fetch');
  const fetchCookie = (globalThis as any).fetchCookie ? (globalThis as any).fetchCookie : require('fetch-cookie').default;
  const fetch = fetchCookie(nodeFetch);
  return {
    fetch,
  };
};

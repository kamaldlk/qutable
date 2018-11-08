import shortid from 'shortid';

function generateId(name) {
  return `${name}-${shortid.generate()}`;
}

function getCurrentModelId(history) {
  let url = history.location.pathname;
  return url.split("/")[2];
}

function values(obj) {
  const result = [];
  for (const k in obj) {
    result.push(obj[k]);
  }
  return result;
}

export { generateId, getCurrentModelId, values };

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

function getEpochString(timestamp) {
  // Epochs
  const epochs = [
    ['Year', 31536000],
    ['Month', 2592000],
    ['Day', 86400],
    ['Hour', 3600],
    ['Min', 60]
    // ['Sec', 1]
  ];

  // Get duration
  const getDuration = (timeAgoInSeconds) => {
    for (let [name, seconds] of epochs) {
      const interval = Math.floor(timeAgoInSeconds / seconds);

      if (interval >= 1) {
        return {
          interval: interval,
          epoch: name
        };
      }
    }
  };

  const timeAgoInSeconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
  const epochDetail = getDuration(timeAgoInSeconds);
  if (!epochDetail) {
    return "now";
  }
  const { interval, epoch } = getDuration(timeAgoInSeconds);
  const suffix = interval === 1 ? '' : 's';
  return `${interval} ${epoch}${suffix} ago`;
}

export { generateId, getCurrentModelId, values, getEpochString };

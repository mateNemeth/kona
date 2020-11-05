const logger = (type, message) => {
  const eventTime = new Date();
  const date = eventTime.toISOString().slice(0, 10);
  const time = eventTime.toISOString().slice(11, 19);

  if (type === 'error') {
    console.error(`[${date} ${time}] | [${type.toUpperCase()}]: ${message}`);

    return;
  }

  type !== 'error' &&
    console.log(`[${date} ${time}] | [${type.toUpperCase()}]: ${message}`);
};

module.exports = logger;

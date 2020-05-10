const logger = (type, message, module) => {
  const eventTime = new Date();
  const date = eventTime.toISOString().slice(0, 10);
  const time = eventTime.toISOString().slice(11, 19);

  type === 'error' &&
    console.error(
      `[${date} ${time}] | [${type.toUpperCase()}] | [${module}]: ${message}`
    );

  type !== 'error' &&
    console.log(
      `[${date} ${time}] | [${type.toUpperCase()}] | [${module}]: ${message}`
    );
};

module.exports = logger;

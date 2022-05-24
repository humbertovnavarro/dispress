import { stderr, stdout } from 'process';
import { getConfig } from './config';
import fs from 'fs';
import path from 'path';
import prisma from './PrismaClient';

enum LogLevel {
  log = 'log',
  error = 'error',
  warn = 'warn'
}

const processors = Array<(log: string, level: LogLevel, raw?: any[]) => void>();

function getTime() {
  const now = new Date(Date.now());
  let month = now.getMonth();
  let day = now.getDate();
  let year = now.getFullYear();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();
  let hours = now.getHours();
  const time = `${hours}:${minutes}:${seconds}`;
  const date = `${month}/${day}/${year}`;
  return `${date} ${time}`;
}

function Log(level: LogLevel, ...args: any[]) {
  const time = getTime();
  const argStrings = args.map(arg => {
    if (typeof arg === 'string') {
      return arg;
    } else if (typeof arg === 'object') {
      return JSON.stringify(arg);
    } else if (typeof arg === 'undefined' || typeof arg === null) {
      return '';
    } else {
      return arg.toString();
    }
  });
  const coloredArgStrings = args.map(arg => {
    if (typeof arg === 'string') {
      return `\u001b[37m${arg}\u001b[0m`;
    } else if (typeof arg === 'object') {
      return `\u001b[34m${JSON.stringify(arg)}\u001b[0m`;
    } else if (typeof arg === 'undefined' || typeof arg === null) {
      return '';
    } else {
      return `\u001b[33m${arg.toString()}\u001b[0m`;
    }
  });
  const uncoloredOutputString = `[${time}] ${argStrings.join(' ')}`;
  processors.forEach(processor =>
    processor(uncoloredOutputString, level, args)
  );
  const colorizedOutputString = `\x1b[${getColor(
    level
  )}m[${time}]\x1b[0m ${coloredArgStrings.join(' ')}`;
  switch (level) {
    case LogLevel.log:
      stdout.write(colorizedOutputString + '\n');
      break;
    case LogLevel.error:
      stderr.write(colorizedOutputString + '\n');
      break;
    case LogLevel.warn:
      stdout.write(colorizedOutputString + '\n');
      break;
  }
}

console.log = (...args: any[]) => {
  Log(LogLevel.log, ...args);
};

console.error = (...args: any[]) => {
  Log(LogLevel.error, ...args);
};

console.warn = (...args: any[]) => {
  Log(LogLevel.warn, ...args);
};

function getColor(level: LogLevel) {
  switch (level) {
    case LogLevel.log:
      return '32';
    case LogLevel.error:
      return '31';
    case LogLevel.warn:
      return '33';
  }
}

processors.push(function (log: string) {
  const location = path.resolve(getConfig('LOG_FILE') || './dispress.log');
  fs.writeFileSync('./dispress.log', log + '\n', { flag: 'a' });
});

processors.push(async function (log: string, level: LogLevel) {
  let levelString = 'log';
  switch (level) {
    case LogLevel.log:
      levelString = 'log';
      break;
    case LogLevel.error:
      levelString = 'error';
      break;
    case LogLevel.warn:
      levelString = 'warn';
  }
  await prisma.logs.create({
    data: {
      text: log,
      level: levelString
    }
  });
});

import winston from 'winston';


const log_level = 'debug'; // 日志级别 debug/http/info/warn/error
const log_file = false; // 假设log_file变量在这里定义
const plugin_name = '一言'; // 假设plugin_name变量在这里定义

// 初始化日志系统
const logger = winston.createLogger({
  level: log_level,
  format: winston.format.combine(
    winston.format.colorize(), // 添加颜色支持
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}][${level}] ${message}`; // 颜色会自动应用到level上
    })
  ),
  transports: [
    new winston.transports.Console(),
  ]
});

if (log_file) {
  logger.add(
    new winston.transports.File({
      filename: `${plugin_name}.log`,
      format: winston.format.combine(
        // 文件日志不需要颜色，所以这里去掉colorize
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}][${level.toUpperCase()}] ${message}`;
        })
      )
    })
  );
}

// 默认导出logger
export default logger;


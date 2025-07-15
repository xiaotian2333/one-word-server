import express from 'express';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import logger from './lib/logger.js';
import getip from './lib/ip.js';

const dataPath = path.join(process.cwd().replace(/\\/g, '/'), '心跳引擎.json');
const app = express();
const PORT = 7860;
//const dataurl = 'http://127.0.0.1:8080/%E4%B8%80%E8%A8%80/%E5%BF%83%E8%B7%B3%E5%BC%95%E6%93%8E.json'; // 示例URL
const dataurl = process.env.DATAURL

// 读取 JSON 数据
let heartbeatData;
try {
    if (fs.existsSync(dataPath)) {
        const rawData = fs.readFileSync(dataPath, 'utf8');
        heartbeatData = JSON.parse(rawData);
    } else {
        const response = await axios.get(dataurl);
        heartbeatData = response.data;
    }
} catch (error) {
    console.error('读取 JSON 数据失败:', error);
    process.exit(1);
}

// 设置 CORS 和 JSON 响应
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Content-Type', 'application/json; charset=utf-8');
    next();
});

// 一言 API 路由
app.get('/', (req, res) => {
    logger.http(`[${getip(req)}][${req.method}]请求 ${req.url}`)
    try {
        // 从 data 数组中随机选择一条数据
        const randomIndex = Math.floor(Math.random() * heartbeatData.data.length);
        const randomSentence = heartbeatData.data[randomIndex];
        
        // 构造返回的 JSON 响应
        const response = {
            sentence: randomSentence.sentence,
            speaker: randomSentence.speaker,
            chapter_title: randomSentence.chapter_title,
            version: heartbeatData.version,
            update: heartbeatData.update
        };
        
        res.json(response);
    } catch (error) {
        logger.error('生成一言失败:', error);
        res.status(500).json({
            error: '服务器内部错误',
            version: heartbeatData.version,
            update: heartbeatData.update
        });
    }
});

// 获取所有数据的路由（可选）
app.get('/all', (req, res) => {
    logger.http(`[${getip(req)}][${req.method}]请求 ${req.url}`)
    res.json({
        title: heartbeatData.title,
        author: heartbeatData.author,
        description: heartbeatData.description,
        total_sentences: heartbeatData.data.length,
        version: heartbeatData.version,
        update: heartbeatData.update
    });
});

// 启动服务器
app.listen(PORT, () => {
    logger.info(`心跳引擎一言服务已启动`);
    logger.info(`服务地址: http://localhost:${PORT}`);
    logger.info(`数据来源: ${heartbeatData.title} - ${heartbeatData.author}`);
    logger.info(`共收录 ${heartbeatData.data.length} 条语句`);
    logger.info(`版本: ${heartbeatData.version}`);
    logger.info(`更新时间: ${heartbeatData.update}`);
});

// 关闭服务器
process.on('SIGINT', () => {
    logger.info('\n正在关闭服务器...');
    process.exit(0);
});

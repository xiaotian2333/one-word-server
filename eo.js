// 心跳引擎一言 腾讯云边缘函数 (EdgeOne)

// 默认数据URL
const DEFAULT_DATA_URL = 'https://oss.xt-url.com/%E4%B8%80%E8%A8%80/%E5%BF%83%E8%B7%B3%E5%BC%95%E6%93%8E.json'

// 主页HTML内容
const INDEX_HTML = `<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>心跳引擎一言</title>
    <style>
        .container {
            width: 20%;
            margin: 10% auto 0;
            background-color: rgba(240, 240, 240, 0.719);
            padding: 2% 5%;
            border-radius: 50px
            }
        ul {padding-left: 20px;}
        ul li {line-height: 2.3}
        a {color: #d256eb}
        body {
            background-image: url('https://api.xsot.cn/bing/?jump=true');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            background-attachment: fixed;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>心跳引擎一言</h1>
        <h3>数据来源：<a href="https://linux.do/t/topic/777979/" target="_blank">这篇文章</a></h3>
        <h2>使用方式</h2>
        <text><a href="./get" target="_blank">/get</a> 返回一言文本</text><br>
        <text><a href="./info" target="_blank">/info</a> 返回api统计信息</text><br>
        <h5>api作者：xiaotian</h5>
    </div>
</body>
</html>`

// 全局变量存储数据
let heartbeatData = null

// 初始化函数，获取数据
async function fetchHeartbeatData() {
    try {
        const response = await fetch(DEFAULT_DATA_URL)

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error('获取心跳引擎数据失败:', error)
        throw error
    }
}

// 创建JSON响应的辅助函数
function createJsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status: status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
        }
    })
}

// 创建HTML响应的辅助函数
function createHtmlResponse(html, status = 200) {
    return new Response(html, {
        status: status,
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
        }
    })
}

// 日志函数，无调用，注释掉以节省函数执行时间
//function logRequest(request, path) {
//    const ip = request.headers.get('x-forwarded-for') ||
//        request.headers.get('cf-connecting-ip') ||
//        'unknown'
//    console.log(`[${ip}][${request.method}]请求 ${path}`)
//}

// 主处理函数
async function handleRequest(request) {
    const url = new URL(request.url)
    const path = url.pathname

    // 确保数据已加载
    if (!heartbeatData) {
        try {
            heartbeatData = await fetchHeartbeatData()
        } catch (error) {
            return createJsonResponse({ error: '服务器内部错误：无法获取数据' }, 500)
        }
    }

    // 处理 OPTIONS 请求（CORS 预检）
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        })
    }

    // 根据路径处理请求
    // logRequest(request, path) // 注释日志记录，节省函数执行时间

    // 主页 - 返回HTML页面
    if (path === '/' || path === '') {
        return createHtmlResponse(INDEX_HTML)
    }

    // 网站logo - 返回重定向到oss站
    if (path === '/favicon.ico') {
        return Response.redirect('https://oss.xt-url.com/web-logo/heartbeat-engine-api.xt-url.com.ico', 302)
    }

    // /get 路径 - 返回随机一言
    if (path === '/get') {
        try {
            // 从 data 数组中随机选择一条数据
            const randomIndex = Math.floor(Math.random() * heartbeatData.data.length)
            const randomSentence = heartbeatData.data[randomIndex]

            // 构造返回的 JSON 响应
            const response = {
                sentence: randomSentence.sentence,
                speaker: randomSentence.speaker,
                chapter_title: randomSentence.chapter_title,
            }

            return createJsonResponse(response)
        } catch (error) {
            console.error('生成一言失败:', error)
            return createJsonResponse({
                error: '服务器内部错误',
                version: heartbeatData.version || '未知',
                update: heartbeatData.update || '未知'
            }, 500)
        }
    }

    // /info 路径 - 返回数据信息
    if (path === '/info') {
        return createJsonResponse({
            title: heartbeatData.title,
            author: heartbeatData.author,
            cover: heartbeatData.cover,
            description: heartbeatData.description,
            total_sentences: heartbeatData.data.length,
            version: heartbeatData.version,
            update: heartbeatData.update,
            instructions: heartbeatData.instructions,
            data_source: heartbeatData.data_source,
            former_name: heartbeatData.former_name
        })
    }

    // 其他路径重定向到主页（404处理）
    return Response.redirect(new URL('/', url), 302)
}

// 腾讯云边缘函数入口点
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

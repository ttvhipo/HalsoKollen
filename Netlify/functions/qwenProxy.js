const fetch = require('node-fetch');

exports.handler = async (event) => {
    const QWEN_API_URL = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions";
    const QWEN_API_KEY = process.env.QWEN_API_KEY;  // Securely stored in Netlify

    try {
        const response = await fetch(QWEN_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${QWEN_API_KEY}`
            },
            body: event.body
        });

        const data = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};

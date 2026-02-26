import { Client } from '@notionhq/client';
import { DateTime } from 'luxon';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

export default async function handler(req, res) {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const { taskId } = req.body;
        if (!taskId) {
            return res.status(400).json({ error: 'Missing taskId' });
        }

        const now = DateTime.now().setZone('Asia/Taipei').toFormat('yyyy-MM-dd HH:mm:ss');
        const recordText = `🍅 ${now} 成功完成 1 個番茄鐘`;

        // 嘗試取得該頁面的第一個區塊 (block)
        const childrenList = await notion.blocks.children.list({
            block_id: taskId,
            page_size: 1
        });

        const appendParams = {
            block_id: taskId,
            children: [
                {
                    object: 'block',
                    type: 'bulleted_list_item',
                    bulleted_list_item: {
                        rich_text: [
                            {
                                type: 'text',
                                text: { content: recordText }
                            }
                        ]
                    }
                }
            ]
        };

        // 如果頁面有現有的區塊，則插入在第一個區塊的「下方」
        // Notion API 目前不支援直接 insertBefore(第一個區塊)，因此我們放在第一個區塊之後
        // 這樣若是持續插入，新的紀錄就會不斷出現在原本頁面第一行的正下方（達成近乎頂端的效果，且新舊順序是由新到舊）
        if (childrenList.results.length > 0) {
            appendParams.after = childrenList.results[0].id;
        }

        const response = await notion.blocks.children.append(appendParams);

        res.status(200).json({
            success: true,
            message: 'Pomodoro record added successfully',
            data: response
        });
    } catch (error) {
        console.error('Error adding pomodoro record:', error);
        res.status(500).json({ error: 'Failed to add pomodoro record', details: error.message });
    }
}

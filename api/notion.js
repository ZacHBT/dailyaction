import { Client } from '@notionhq/client';
import { DateTime } from 'luxon';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = process.env.NOTION_DATABASE_ID || '182b6925914d806396dfe3524e726136';

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

    const today = DateTime.now().setZone('Asia/Taipei').toISODate();

    try {
        const response = await notion.databases.query({
            database_id: DATABASE_ID,
            filter: {
                property: '日期',
                date: {
                    equals: today,
                },
            },
        });

        const tasks = response.results.map((page) => {
            const props = page.properties;
            return {
                id: page.id,
                url: page.url,
                name: props.名稱?.title[0]?.plain_text || '無標題',
                category: props.分類?.select?.name || '個人',
                completed: props.達成?.checkbox || false,
            };
        });

        res.status(200).json({
            lastUpdated: new Date().toISOString(),
            tasks: tasks,
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks', details: error.message });
    }
}

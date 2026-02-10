import { Client } from '@notionhq/client';
import fs from 'fs';
import { DateTime } from 'luxon';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = '182b6925914d806396dfe3524e726136';

async function fetchTasks() {
  const today = DateTime.now().setZone('Asia/Taipei').toISODate();
  console.log(`Fetching tasks for ${today}...`);

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

    const data = {
      lastUpdated: new Date().toISOString(),
      tasks: tasks,
    };

    fs.writeFileSync('./public/data.json', JSON.stringify(data, null, 2));
    console.log(`Successfully saved ${tasks.length} tasks to data.json`);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    process.exit(1);
  }
}

fetchTasks();

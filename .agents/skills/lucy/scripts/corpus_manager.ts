import { getSupabaseClient } from '../../../../src/lib/supabaseClient';

function parseArgs(args: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const val = args[i + 1];
      if (val && !val.startsWith('--')) {
        result[key] = val;
        i++;
      } else {
        result[key] = 'true';
      }
    }
  }
  return result;
}

async function main() {
  const action = process.argv[2];
  const params = parseArgs(process.argv.slice(3));

  const client = getSupabaseClient() as any;
  if (!client) {
    console.error('Database client not initialized');
    process.exit(1);
  }

  if (action === 'add') {
    const title = params.title;
    const category = params.category;
    const notes = params.notes;

    if (!title || !category) {
      console.error('Error: --title and --category parameters are required.');
      console.log('Example: add --title "Elden Ring Review" --category game --notes "Draft outline"');
      process.exit(1);
    }

    const id = `corp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const { data, error } = await client
      .from('content_corpus')
      .insert([
        {
          id,
          title,
          category,
          notes: notes || '',
          status: 'backlog'
        }
      ])
      .select('*');

    if (error) {
      console.error('Database Error:', error.message);
      process.exit(1);
    }

    console.log(`✅ Success: Added planning item to corpus. ID: ${id}`);
    process.exit(0);
  } 
  
  if (action === 'list') {
    const { data, error } = await client
      .from('content_corpus')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database Error:', error.message);
      process.exit(1);
    }

    console.log('📡 ACTIVE PLANNING CORPUS ITEMS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    (data || []).forEach((item: any) => {
      console.log(`- [${item.status.toUpperCase()}] ${item.title} (${item.category.toUpperCase()})`);
      if (item.notes) console.log(`  Notes: ${item.notes}`);
      if (item.published_url) console.log(`  Live URL: ${item.published_url}`);
    });
    process.exit(0);
  }

  console.log('Usage:\n  add --title <title> --category <cat> [--notes <notes>]\n  list');
  process.exit(1);
}

main().catch(err => {
  console.error('Runner Error:', err);
  process.exit(1);
});

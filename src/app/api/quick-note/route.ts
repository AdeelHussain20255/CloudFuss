import { NextRequest, NextResponse } from 'next/server';
import { uploadToMega } from '@/lib/mega';
import { supabase } from '@/lib/server-supabase';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { content, categoryId, userName } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'No content provided' }, { status: 400 });
    }

    const fileName = `note_${Date.now()}.txt`;
    const buffer = Buffer.from(content, 'utf-8');
    const megaUrl = await uploadToMega(buffer, fileName);

    let categoryName = categoryId;
    if (categoryId && categoryId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      const { data: cat } = await supabase
        .from('categories')
        .select('name')
        .eq('id', categoryId)
        .single();
      if (cat) categoryName = cat.name;
    }

    const { data, error } = await supabase
      .from('files')
      .insert({
        name: fileName,
        size: buffer.length,
        category_id: categoryId?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ? categoryId : null,
        category_name: categoryName,
        mega_url: megaUrl,
        user_name: userName || 'Anonymous',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, file: data });
  } catch (error) {
    console.error('Quick note error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create note' },
      { status: 500 }
    );
  }
}
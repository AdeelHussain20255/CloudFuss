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

    let finalCategoryId: string | null = null;
    let finalCategoryName = 'Notes';

    if (categoryId && categoryId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      finalCategoryId = categoryId;
      const { data: cat } = await supabase
        .from('categories')
        .select('name')
        .eq('id', categoryId)
        .single();
      if (cat) finalCategoryName = cat.name;
    } else {
      const searchName = (categoryId && categoryId !== 'all') ? categoryId : 'Notes';
      
      // Attempt friendly conversions
      let resolvedName = searchName;
      if (searchName.toLowerCase() === 'pastpapers') resolvedName = 'Past Papers';
      else if (searchName.toLowerCase() === 'csstuff') resolvedName = 'CS Stuff';
      else if (searchName.toLowerCase() === 'certificates') resolvedName = 'Certificates';
      else if (searchName.toLowerCase() === 'notes') resolvedName = 'Notes';

      const { data: cat } = await supabase
        .from('categories')
        .select('id, name')
        .ilike('name', resolvedName)
        .single();

      if (cat) {
        finalCategoryId = cat.id;
        finalCategoryName = cat.name;
      } else {
        finalCategoryName = resolvedName;
      }
    }

    const { data, error } = await supabase
      .from('files')
      .insert({
        name: fileName,
        size: buffer.length,
        category_id: finalCategoryId,
        category_name: finalCategoryName,
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
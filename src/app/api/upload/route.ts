import { NextRequest, NextResponse } from 'next/server';
import { uploadToMega } from '@/lib/mega';
import { supabase } from '@/lib/server-supabase';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const categoryId = formData.get('categoryId') as string;
    const userName = formData.get('userName') as string || 'Anonymous';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const megaUrl = await uploadToMega(buffer, file.name);

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
        name: file.name,
        size: file.size,
        category_id: categoryId?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ? categoryId : null,
        category_name: categoryName,
        mega_url: megaUrl,
        user_name: userName,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, file: data });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
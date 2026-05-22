import { NextRequest, NextResponse } from 'next/server';
import { uploadToMega } from '@/lib/mega';
import { supabase } from '@/lib/server-supabase';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    // Robust safety check: verify file is present and is a valid upload object
    if (!file || typeof file === 'string' || !(file instanceof Blob || (file && typeof (file as any).arrayBuffer === 'function'))) {
      return NextResponse.json({ error: 'No valid file provided' }, { status: 400 });
    }

    const categoryId = formData.get('categoryId') as string;
    const userName = formData.get('userName') as string || 'Anonymous';

    // Safely extract the filename, size, and convert the arrayBuffer to a Node Buffer
    const fileName = (file as any).name || `upload_${Date.now()}`;
    const fileSize = (file as any).size || 0;
    
    const arrayBuffer = await (file as any).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

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
        size: fileSize,
        category_id: finalCategoryId,
        category_name: finalCategoryName,
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
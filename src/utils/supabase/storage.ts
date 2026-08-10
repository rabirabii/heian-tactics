import { createClient } from './client';

export async function uploadImageToSupabase(file: File, prefix: string = 'upload'): Promise<string> {
  const supabase = createClient();
  const fileExt = file.name.split('.').pop();
  const fileName = `${prefix}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `images/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('images')
    .upload(filePath, file, { cacheControl: '3600', upsert: false });

  if (uploadError) {
    throw new Error('Failed to upload image: ' + uploadError.message);
  }

  const { data: publicUrlData } = supabase.storage
    .from('images')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

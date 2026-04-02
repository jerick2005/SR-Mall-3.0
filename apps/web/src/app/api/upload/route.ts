import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { validateImageFile } from '@/lib/cloud-storage';

export async function POST(request: NextRequest) {
  try {
    console.log('=== UPLOAD API CALLED ===');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'ads';

    console.log('File info:', {
      name: file?.name,
      size: file?.size,
      type: file?.type,
      folder: folder
    });

    if (!file) {
      console.error('No file provided');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file (supports both images and videos)
    const validation = validateImageFile(file);
    console.log('File validation:', validation);
    
    if (!validation.valid) {
      console.error('File validation failed:', validation.error);
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', folder);
    console.log('Upload directory:', uploadsDir);
    
    try {
      await mkdir(uploadsDir, { recursive: true }); 
      console.log('Directory created or exists');
    } catch (error) {
      console.log('Directory creation error (might already exist):', error);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}_${randomString}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);
    
    console.log('Generated filename:', fileName);
    console.log('File path:', filePath);

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);
    
    console.log('File written successfully');

    // Determine media type
    const mediaType = file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE';

    // Return file info
    const fileUrl = `/uploads/${folder}/${fileName}`;
    
    console.log('Upload successful, returning:', {
      url: fileUrl,
      key: `${folder}/${fileName}`,
      fileName: fileName,
      mediaType: mediaType
    });
    
    return NextResponse.json({
      success: true,
      url: fileUrl,
      key: `${folder}/${fileName}`,
      fileName: fileName,
      mediaType: mediaType
    });
  } catch (error) {
    console.error('Upload API error:', error);
    console.error('Error stack:', (error as Error).stack);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'No file key provided' },
        { status: 400 }
      );
    }

    // For local storage, delete file from filesystem
    const filePath = join(process.cwd(), 'public', 'uploads', key);
    
    try {
      const { unlink } = require('fs/promises');
      await unlink(filePath);
      
      return NextResponse.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      console.error('Delete file error:', error);
      return NextResponse.json(
        { error: 'Failed to delete file' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Delete API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

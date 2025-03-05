import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseConfig.projectURl,
      environment.supabaseConfig.apiKey
    );
  }

  async checkUserSession() {
    const { data, error } = await this.supabase.auth.getSession();
    if (error) {
      console.error('Error al recuperar la sesión:', error);
      return null;
    }
    return data.session;
  }

  async uploadImageSupabase(path: string, imageUrl: string, contentType: string): Promise<string> {
    const blob = this.dataUrlToBlob(imageUrl);
    const file = new File([blob], path.split('/')[1], {
      type: blob.type,
    });

    const uploadResult = await this.supabase.storage
      .from(environment.supabaseConfig.bucket)
      .upload(path, file, { upsert: true });
    if (uploadResult.error) {
      throw uploadResult.error;
    }
    const urlInfo = await this.supabase.storage
      .from(environment.supabaseConfig.bucket)
      .getPublicUrl(path);
    return urlInfo.data.publicUrl;
  }

  // Convertir dataUrl a Blob
  private dataUrlToBlob(dataUrl: string): Blob {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1]; // Extraer el tipo MIME (por ejemplo, "image/jpeg")
    const bstr = atob(arr[1]); // Decodificar base64
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
  }

  getFilePath(publicUrl: string): string | null {
    try {
      const url = new URL(publicUrl);

      // Buscar el segmento `/storage/v1/object/public/`
      const publicPrefix = '/storage/v1/object/public/' + environment.supabaseConfig.bucket + '/';
      const startIndex = url.pathname.indexOf(publicPrefix);

      if (startIndex === -1) {
        throw new Error(
          'La URL no es válida o no pertenece a Supabase Storage.'
        );
      }

      // Obtener el resto de la ruta después del prefijo
      const filePath = url.pathname.substring(startIndex + publicPrefix.length);

      return filePath;
    } catch (error) {
      console.error('Error al extraer el path del archivo:', error);
      return null;
    }
  }

  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.storage
        .from(environment.supabaseConfig.bucket)
        .remove([filePath]);

      if (error) {
        console.error('Error al eliminar el archivo:', error);
        return false;
      }

      console.log(`Archivo eliminado: ${filePath}`);
      return true;
    } catch (error) {
      console.error('Error inesperado al intentar eliminar el archivo:', error);
      return false;
    }
  }
}
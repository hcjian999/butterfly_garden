import { useCallback } from 'react';

export function useImageCompress() {
  const compressImages = useCallback((files: FileList): Promise<string[]> => {
    const promises: Promise<string>[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const promise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            let width = img.width;
            let height = img.height;
            if (width > MAX_WIDTH) {
              height = (height * MAX_WIDTH) / width;
              width = MAX_WIDTH;
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
      promises.push(promise);
    }

    return Promise.all(promises);
  }, []);

  return { compressImages };
}
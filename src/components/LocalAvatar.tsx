import { Avatar, SxProps, Theme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { selectSettings } from '../appStateSlice';
import { useAppSelector } from '../hooks';
import { imageGeneration } from '../OpenAiApi';

type LocalAvatarProps = {
  id: string;
  prompt: string;
  sx?: SxProps<Theme> | undefined;
  onClick?: React.MouseEventHandler<HTMLDivElement> | undefined
};

export default function LocalAvatar({ id, prompt, sx, onClick }: LocalAvatarProps) {
  const [base64ImgFromLocalStorage, setBase64ImgFromLocalStorage] = useState('');
  const settings = useAppSelector(selectSettings);
    useEffect(() => {
      const imgFromLocal = localStorage.getItem(id);
      if (imgFromLocal !== null) {
          setBase64ImgFromLocalStorage(imgFromLocal)
      }else{
          imageGeneration(settings, prompt)
            .then(img => {
              localStorage.setItem(id, img);
              setBase64ImgFromLocalStorage(img);
            } );
      }
  }, [id]);

  return <Avatar 
        src={`data:image/png;base64, ${base64ImgFromLocalStorage}`} 
        alt={prompt}
        sx={sx}
        onClick={onClick}
  />;
}
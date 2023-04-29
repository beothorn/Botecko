import { Avatar, SxProps, Theme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { selectSettings } from '../appStateSlice';
import { useAppSelector } from '../hooks';
import { imageGeneration } from '../OpenAiApi';
import { addAvatar, getAvatar } from '../persistence/indexeddb';

type LocalAvatarProps = {
  id: string;
  prompt?: string;
  sx?: SxProps<Theme> | undefined;
  onClick?: React.MouseEventHandler<HTMLDivElement> | undefined
};

export default function LocalAvatar({ id, prompt, sx, onClick }: LocalAvatarProps) {
  const [base64Img, setBase64Img] = useState('');
  const settings = useAppSelector(selectSettings);
  useEffect(() => {
    getAvatar(id).then(avatar => {
      if(avatar){
        setBase64Img(avatar.img);
      }else{
        if(prompt){
          imageGeneration(settings, prompt as string)
              .then(img => {
                addAvatar(id, img);
                setBase64Img(img);
              } );
        }
      }       
    })
  }, [id]);

  return <Avatar 
        src={`data:image/png;base64, ${base64Img}`} 
        alt={prompt}
        sx={sx}
        onClick={onClick}
  />;
}
import { Avatar, SxProps, Theme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../hooks';
import { getCurrentImageGeneration } from '../api/imageApi';
import { addAvatar, getAvatar, updateAvatar } from '../persistence/indexeddb';
import { selectSettings } from '../selectors';

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
      if (avatar && avatar.img !== '') {
        setBase64Img(avatar.img);
      } else {
        if (prompt) {
          const currentImageGeneration = getCurrentImageGeneration(settings);
          currentImageGeneration(prompt as string)
            .then(img => {
              if (avatar?.img === '') {
                updateAvatar(id, img)
              } else {
                addAvatar(id, img);
              }
              setBase64Img(img);
            });
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
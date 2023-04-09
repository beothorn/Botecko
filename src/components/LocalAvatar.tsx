import { Avatar, SxProps, Theme } from '@mui/material';
import React, { useEffect, useState } from 'react';

type LocalAvatarProps = {
  id: string;
  sx?: SxProps<Theme> | undefined;
  onClick?: React.MouseEventHandler<HTMLDivElement> | undefined
};

export default function LocalAvatar({ id, sx, onClick }: LocalAvatarProps) {
    const [base64ImgFromLocalStorage, setBase64ImgFromLocalStorage] = useState('');
    useEffect(() => {
        const imgFromLocal = localStorage.getItem(id);
        if (imgFromLocal !== null) {
            setBase64ImgFromLocalStorage(imgFromLocal)
        }
    }, [id]);

    return <Avatar 
        src={`data:image/png;base64, ${base64ImgFromLocalStorage}`} 
        sx={sx}
        onClick={onClick}
    />;
}
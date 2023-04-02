import { AppBar, IconButton, Menu, MenuItem, Toolbar, Typography, styled } from '@mui/material';
import React, { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';

const AppBarStyled = styled(AppBar)(({theme}) => ({
  backgroundColor: theme.palette.primary.dark,
  color: theme.palette.primary.contrastText,
  marginBottom: "1rem",
}));

function ScreenTitleRaw({title}: ScreenTitleProps){
  return <Typography variant="h6">{title}</Typography>;
};

export const ScreenTitle = styled(ScreenTitleRaw)(() => ({
  flexGrow: 1
}));

type Props = {
    children: React.ReactNode;
    menuItems?: Record<string, () => void>;
    leftItem?: React.ReactNode;
    centerItem?: React.ReactNode;
    barPosition?: "fixed" | "absolute" | "relative" | "static" | "sticky" | undefined
};

type ScreenTitleProps = {
    title: string;
};

export default function Screen({ children, menuItems, leftItem, centerItem, barPosition }: Props){
    // Add state for the menu
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const callback = (c: () => void) => {
        setAnchorEl(null);
        c();
    };

    return (<>
    <AppBarStyled position={barPosition || "static"}>
        <Toolbar>
          {leftItem}
          {centerItem}
          {menuItems && (
            <>
              <IconButton
                color="inherit"
                aria-label="menu"
                onClick={handleOpen}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                {Object.entries(menuItems).map(([label, action]) => (
                  <MenuItem key={label} onClick={() => callback(action)}>
                    {label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBarStyled>
      <div>
        {children}
      </div>
    </>);
}
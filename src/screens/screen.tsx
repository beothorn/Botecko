import { AppBar, IconButton, Menu, MenuItem, MenuProps, Toolbar, Typography, styled } from '@mui/material';
import React, { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';

const AppBarStyled = styled(AppBar)(() => ({
  backgroundColor: '#000',
  color: '#eee',
}));

function ScreenTitleRaw({title, className, onClick}: ScreenTitleProps){
  return <Typography className={className} variant="h6" onClick={onClick}>{title}</Typography>;
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
    className?: string;
    onClick?: () => void;
    title: string;
};

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    backgroundColor: theme.palette.secondary.contrastText,
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        backgroundColor: theme.palette.secondary.contrastText,
      },
      '&:active': {
        backgroundColor: theme.palette.secondary.contrastText,
      },
      '&:hover': {
        color: theme.palette.secondary.contrastText,
        backgroundColor: theme.palette.secondary.main,
      },
    },
  },
}));

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
              <StyledMenu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                {Object.entries(menuItems).map(([label, action]) => (
                  <MenuItem key={label} onClick={() => callback(action)}>
                    {label}
                  </MenuItem>
                ))}
              </StyledMenu>
            </>
          )}
        </Toolbar>
      </AppBarStyled>
      <div>
        {children}
      </div>
    </>);
}
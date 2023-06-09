import { AppBar, IconButton, MenuItem, Toolbar, Typography, styled } from '@mui/material';
import React, { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import StyledMenu from '../components/StyledMenu';

const AppBarStyled = styled(AppBar)(() => ({
  backgroundColor: '#000',
  color: '#eee',
}));

function ScreenTitleRaw({title, className, onClick}: ScreenTitleProps){
  return <Typography className={className} variant="h6" onClick={onClick}>{title}</Typography>;
}

export const ScreenTitle = styled(ScreenTitleRaw)(() => ({
  flexGrow: 1
}));

export type Background = 'carbon';

export const Content = styled('div')(({backgroungImg}: {backgroungImg?:Background}) => {
  if(backgroungImg === 'carbon'){
    return {
      backgroundImage: `url("/imgs/carbon_fibre.png")`,
    };
  }
  return {};
});


type Props = {
    children: React.ReactNode;
    menuItems?: Record<string, () => void>;
    leftItem?: React.ReactNode;
    centerItem?: React.ReactNode;
    backgroungImg?: Background;
    barPosition?: "fixed" | "absolute" | "relative" | "static" | "sticky" | undefined
};

type ScreenTitleProps = {
    className?: string;
    onClick?: () => void;
    title: string;
};

export default function Screen({ children, menuItems, leftItem, centerItem, barPosition, backgroungImg }: Props){
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
    <AppBarStyled position={barPosition || "sticky"}>
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
      <Content backgroungImg={backgroungImg}>
        {children}
      </Content>
    </>);
}
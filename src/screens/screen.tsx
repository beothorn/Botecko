import { makeStyles } from '@material-ui/core';
import { AppBar, IconButton, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import React, { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';

const styles = makeStyles((theme) => ({
    title: {
        flexGrow: 1,
    },
    appBar: {
      backgroundColor: theme.palette.primary.dark,
      color: theme.palette.primary.contrastText,
      marginBottom: "1rem",
    }
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

export function ScreenTitle({title}: ScreenTitleProps){
    const classes = styles();

    return <Typography className={classes.title} variant="h6">{title}</Typography>;
};

export default function Screen({ children, menuItems, leftItem, centerItem, barPosition }: Props){
    const classes = styles();
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
    <AppBar position={barPosition || "static"} className={classes.appBar}>
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
      </AppBar>
      <div>
        {children}
      </div>
    </>);
}
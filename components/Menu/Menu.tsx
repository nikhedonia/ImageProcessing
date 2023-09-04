import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import AppsIcon from '@mui/icons-material/Apps';
import InfoIcon from '@mui/icons-material/Info';
import FolderIcon from '@mui/icons-material/Folder';
import MemoryIcon from '@mui/icons-material/Memory';
import BarChartIcon from '@mui/icons-material/BarChart';
import TerminalIcon from '@mui/icons-material/Terminal';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { Dispatch, SetStateAction, useState } from 'react';
import { Box, Card, CardContent, CardMedia, Divider, List, ListItemButton, Typography } from '@mui/material';
import { ImageEntry } from '@/types';

const FilesContent = ({images}: {images: ImageEntry[]}) => (
  <Box padding={1}>
    {
      images.map( (x, i) => (
        <Card key={i} elevation={5} sx={{ maxWidth: 345, margin: 2, padding:1 }}>
          <CardMedia
            style={{ height: 140 }}
            image={x.url}
            title={x.name}
          />
          <CardContent>
            {x.name}
          </CardContent>
        </Card>      
      ))
    }
  </Box>
);

const entries = {
  Files: {
    Icon: FolderIcon,
    Content: FilesContent
  },
  Pipeline: {
    Icon: MemoryIcon,
    Content: ()=>null
  },
  Code: {
    Icon: TerminalIcon,
    Content: ()=>null
  }
}

export function MenuOverview({setActive}: {setActive: Dispatch<SetStateAction< keyof (typeof entries) | null>>}) {
  return (
    <>
      {Object.entries(entries).map( ([k,v]) => (
        <ListItem key={k} disablePadding>
          <ListItemButton onClick={()=>setActive(k)}>
            <ListItemIcon>
                <v.Icon />
            </ListItemIcon>
            <ListItemText primary={k} />
          </ListItemButton>
        </ListItem>
      ))}
    </>
  );
}

export function Menu({images}: {images: ImageEntry[]}) {
  const [active, setActive] = useState<keyof(typeof entries) | null>(null);

  if (!active) {
    return (
      <List>
        <ListItem>Overview</ListItem>
        <Divider/>
        <MenuOverview setActive={setActive} />
      </List>
    )
  }

  const Content = entries[active].Content;

  return (
    <List>
      <ListItem disablePadding>
        <ListItemButton onClick={()=>setActive(null)}>
          <ListItemIcon>
            <AppsIcon/> 
          </ListItemIcon>
          <ListItemText primary={"Overview"} />
        </ListItemButton>
      </ListItem>
      <Divider/>
      <Box>
        <Content images={images} />
      </Box>
    </List>
  );


}
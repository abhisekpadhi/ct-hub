import React, {useEffect, useState} from 'react';
import {
    Box, Chip,
    Container, Paper,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer, TableHead,
    TableRow,
    Tabs,
    Typography
} from '@mui/material';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

function PublisherTable() {
    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>Publisher</TableCell>
                        <TableCell>Revenue</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow
                        key={'1'}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell component="th" scope="row">
                            Flappy bird game site
                        </TableCell>
                        <TableCell>
                            <Chip color={'success'} label={"₹2"} />
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    )
}

function CartTable(props: {c: any}) {
    const cart = props.c;
    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>CartID</TableCell>
                        <TableCell>UserID</TableCell>
                        <TableCell>Merchant</TableCell>
                        <TableCell>Total</TableCell>
                        <TableCell>RapydCheckoutId</TableCell>
                        <TableCell>Status</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow
                        key={'1'}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell component="th" scope="row">
                            {cart.cartId}
                        </TableCell>
                        <TableCell>
                            {cart.userId}
                        </TableCell>
                        <TableCell>
                            {cart.merchant}
                        </TableCell>
                        <TableCell>
                            {cart.total}
                        </TableCell>
                        <TableCell>
                            {cart.rapydCheckoutId}
                        </TableCell>
                        <TableCell>
                            <Chip color={cart.status === 'abandoned' ? 'error' : 'success'} label={cart.status} />
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    )
}

function TraitTable(props: {c: any}) {
    const trait = props.c;
    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>UserId</TableCell>
                        <TableCell>Traits</TableCell>
                        <TableCell>ViewerId</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow
                        key={'1'}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell component="th" scope="row">
                            <Chip color={'success'} label={trait.userId} />
                        </TableCell>
                        <TableCell>
                            {trait.traits}
                        </TableCell>
                        <TableCell>
                            {trait.viewerId}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    )
}

const API_URL = import.meta.env.VITE_API_URL;
export default function Dashboard() {
    const [value, setValue] = React.useState(0);
    const [trait, setTrait] = useState<any>();
    const [cart, setCart] = useState<any>();
    const getUserTracker = () => {
        const url = API_URL + '/trait/poll';
        fetch(url)
            .then(r => r.json())
            .then(res => {
                // console.log(`fetched traits: ${JSON.stringify(res)}`);
                const data = res.data;
                setTrait(data[0])
            })
            .catch(console.log);
    }
    const getCart = () => {
        const url = API_URL + '/cart/poll';
        fetch(url)
            .then(r => r.json())
            .then(res => {
                // console.log(`fetched cart: ${JSON.stringify(res)}`);
                const data = res.data;
                setCart(data[0])
            })
            .catch(console.log);
    };
    useEffect(() => {
        getCart();
        getUserTracker();
        const i1 = setInterval(getCart, 4000);
        const i2 = setInterval(getUserTracker, 4000);
        return () => {
            clearInterval(i1);
            clearInterval(i2);
        }
    }, [])
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };
    return (
        <Container>
            <h2>Dashboard...</h2>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Customer tracker" {...a11yProps(0)} />
                    <Tab label="Abandoned carts" {...a11yProps(1)} />
                    <Tab label="Publisher revenue" {...a11yProps(2)} />
                </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
                {trait && (<TraitTable c={trait} />)}
            </TabPanel>
            <TabPanel value={value} index={1}>
                {cart && (<CartTable c={cart}/>)}
            </TabPanel>
            <TabPanel value={value} index={2}>
                <PublisherTable />
            </TabPanel>
        </Container>
    )
}

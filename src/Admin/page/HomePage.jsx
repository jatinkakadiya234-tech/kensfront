import React from "react";
import {
    Box,
    Typography,
    Container,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    useMediaQuery,
    useTheme
} from "@mui/material";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar
} from "recharts";
import {
    MoreVert,
    ArrowUpward,
    ArrowDownward,
    Movie,
    Theaters,
    People,
    MonetizationOn,
    FilterList,
    Refresh
} from "@mui/icons-material";
import { useState } from "react";
import { useEffect } from "react";
import { Apihelper } from "../../common/service/ApiHelper";

// Sample data


const revenueData = [];





const AnalyticsCard = ({ icon, title, value, change, isIncrease, onClick }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));


    return (

        <Paper
            sx={{
                p: isMobile ? 2 : 3,
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: "white",
                borderRadius: 2,
                height: '100%',
                width: '100%',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'transform 0.2s',
                '&:hover': {
                    transform: onClick ? 'translateY(-5px)' : 'none',
                    boxShadow: onClick ? '0 5px 15px rgba(79, 172, 254, 0.3)' : 'none'
                }
            }}
            onClick={onClick}
        >

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant={isMobile ? "caption" : "body2"} sx={{ color: '#999' }}>{title}</Typography>
                    <Typography variant={isMobile ? "h5" : "h4"} sx={{ mt: 1 }}>{value}</Typography>
                </Box>
                <Box sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                    width: isMobile ? 40 : 50,
                    height: isMobile ? 40 : 50,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {React.cloneElement(icon, { fontSize: isMobile ? "small" : "medium" })}
                </Box>
            </Box>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mt: 2,
                color: isIncrease ? '#4CAF50' : '#F44336'
            }}>
                {isIncrease ? <ArrowUpward fontSize={isMobile ? "small" : "medium"} /> : <ArrowDownward fontSize={isMobile ? "small" : "medium"} />}
                <Typography variant={isMobile ? "caption" : "body2"} sx={{ ml: 0.5 }}>
                    {change} {isIncrease ? 'Increase' : 'Decrease'} from last month
                </Typography>
            </Box>
        </Paper>
    );
};

const MovieAnalytics = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
    const [monthlytotal, setmonthlytotal] = React.useState(null);
    const [monthlyRevenue, setMonthlyRevenue] = React.useState(null);
    const [activeCard, setActiveCard] = React.useState(null);
    const [monthlyPremium, setMonthlyPremium] = React.useState(null);

    const [totelView, settotelView] = useState(null)
    const [toteleprimum, settoteleprimum] = useState(null)
    const [totelprofit, settotelprofit] = useState(null);
    const [totelmovise, settotelmovise] = useState(null);
    const [toteluser, settoteluser] = useState(null);
    async function fatchview() {
        try {
            const [totelview, totelmonthycount, totelprimum, totelearnings, totelmovies, toteluser, monthlypremium, monthlyrevenue] = await Promise.all([
                Apihelper.totelView(),
                Apihelper.monthlytotal(),
                Apihelper.premiumtypecounts(),
                Apihelper.totelearnings(),
                Apihelper.ListMovise(),
                Apihelper.toteluser(),
                Apihelper.monthlypremium(),
                Apihelper.monthlyRevenue()

            ])
            settoteleprimum(totelprimum.data)
            setmonthlytotal(totelmonthycount.data)
            setMonthlyRevenue(monthlyrevenue.data)
            settotelprofit(totelearnings.data)
            settotelmovise(totelmovies.data.data.movies)
            settoteluser(toteluser.data)
            setMonthlyPremium(monthlypremium.data)
            if (totelview.status == 200) {
                // console.log(totelview.data)
                settotelView(totelview.data)
            } else {
                console.log("error")
            }

        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        fatchview()
    }, [])

    console.log(toteleprimum)

    function formatNumber(num) {
        if (num >= 10000000) return (num / 10000000).toFixed(1) + 'Cr';
        if (num >= 100000) return (num / 100000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num;
    }
    return (
        <Box sx={{ bgcolor: 'transparent', minHeight: '100vh', py: isMobile ? 2 : 4  }}>
            <Container maxWidth="xl" disableGutters={isMobile}>
                {/* Header with Filters */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: isMobile ? 2 : 4,
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? 2 : 0
                }}>
                    <Typography variant={isMobile ? "h5" : "h4"} sx={{
                        color: 'white',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        mb: isMobile ? 1 : 0
                    }}>
                        <Theaters sx={{ color: '#4facfe', mr: 2, fontSize: isMobile ? "medium" : "large" }} />
                        Movie Analytics
                    </Typography>
                </Box>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-4">
                    <div className="flex w-full">
                        <AnalyticsCard
                            icon={<Movie style={{ color: '#4facfe' }} />}
                            title="Total Movies"
                            value={formatNumber(totelmovise ? totelmovise.length : 0)}
                            isIncrease={true}
                            onClick={() => setActiveCard('movies')}
                        />
                    </div>
                    <div className="flex w-full">
                        <AnalyticsCard
                            icon={<People style={{ color: '#4ecdc4' }} />}
                            title="Total users"
                            value={formatNumber(toteluser ? toteluser.total : 0)}
                            onClick={() => setActiveCard('viewers')}
                            isIncrease={true}
                        />
                    </div>
                    <div className="flex w-full">
                        <AnalyticsCard
                            icon={<MonetizationOn style={{ color: '#45b7d1' }} />}
                            title="Revenue"
                            value={"₹" + formatNumber(totelprofit ? totelprofit : 0)}
                            change="15%"
                            isIncrease={true}
                            onClick={() => setActiveCard('revenue')}
                        />
                    </div>
                    {/* {toteleprimum && toteleprimum.map((x, idx) => (
                        <div className="flex justify-center" key={idx}>
                            <AnalyticsCard
                                icon={<MonetizationOn style={{ color: '#4facfe' }} />}
                                title={`${x.type.charAt(0).toUpperCase() + x.type.slice(1)} Premium`}
                                value={x.count}
                                isIncrease={true}
                                onClick={() => setActiveCard('revenue')}
                            />
                        </div>
                    ))} */}
                </div>


                {/* Charts Row 1 */}

                <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 mb-4`}>
                    {/* Monthly Views Chart */}
                    <div className="bg-[#111] p-3 md:p-5 h-full rounded-md" style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <div className="flex justify-between items-center mb-2 md:mb-4">
                            <h2 className="text-white text-base md:text-lg font-semibold">Monthly earnings</h2>
                            <button className="text-gray-400 p-1 md:p-2">
                                <MoreVert fontSize={isMobile ? "small" : "medium"} />
                            </button>
                        </div>
                        <div className="w-full h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyRevenue || monthlytotal}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="name" stroke="#999" />
                                    <YAxis stroke="#999" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#222',
                                            borderColor: '#333',
                                            color: 'white',
                                        }}
                                    />
                                    {!isMobile && (
                                        <Legend wrapperStyle={{ color: '#999', paddingTop: '10px' }} />
                                    )}
                                    <Bar dataKey="revenue" fill="#4facfe" radius={[4, 4, 0, 0]} name="revenue" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Monthly Premium Upgrades Chart */}
                    <div className="bg-[#111] p-3 md:p-5 h-full rounded-md" style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <div className="flex justify-between items-center mb-2 md:mb-4">
                            <h2 className="text-white text-base md:text-lg font-semibold">Monthly Premium Upgrades</h2>
                            <button className="text-gray-400 p-1 md:p-2">
                                <MoreVert fontSize={isMobile ? "small" : "medium"} />
                            </button>
                        </div>
                        <div className="w-full h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyPremium || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="name" stroke="#999" />
                                    <YAxis stroke="#999" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#222',
                                            borderColor: '#333',
                                            color: 'white',
                                        }}
                                    />
                                    {!isMobile && (
                                        <Legend wrapperStyle={{ color: '#999', paddingTop: '10px' }} />
                                    )}
                                    <Area
                                        type="monotone"
                                        dataKey="premiumCount"
                                        stroke="#4ecdc4"
                                        fill="#4ecdc4"
                                        fillOpacity={0.2}
                                        strokeWidth={2}
                                        name="Premium Count"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </Container>
        </Box>
    );
};

export default MovieAnalytics;
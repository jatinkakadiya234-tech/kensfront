import React, { useEffect, useRef, useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddIcon from '@mui/icons-material/Add';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Rating } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Apihelper } from '../common/service/ApiHelper';

const slides = [
    {
        title: 'Avengers : Endgame',
        description:
            "With the help of remaining allies, the Avengers must assemble once more in order to undo Thanos's actions and undo the chaos to the universe…",
        img: './assets/endgame-banner.png',
    },
    {
        title: 'Kantara',
        description:
            "In the shadowy underworld of Mumbai, one woman rises from betrayal and bloodshed to rewrite the rules of power. ",
        img: './assets/movie-details/movie-poster.png',
    },
    {
        title: 'Kantara',
        description:
            "In the shadowy underworld of Mumbai, one woman rises from betrayal and bloodshed to rewrite the rules of power. ",
        img: './assets/movie-details/movie-poster.png',
    },
    {
        title: 'Kantara',
        description:
            "In the shadowy underworld of Mumbai, one woman rises from betrayal and bloodshed to rewrite the rules of power. ",
        img: './assets/movie-details/movie-poster.png',
    },
    {
        title: 'Kantara',
        description:
            "In the shadowy underworld of Mumbai, one woman rises from betrayal and bloodshed to rewrite the rules of power. ",
        img: './assets/movie-details/movie-poster.png',
    },
];

const genres = [
    { title: "Action", img: "./assets/movies/genres1.png" },
    { title: "Adventure", img: "./assets/movies/genres2.png" },
    { title: "Comedy", img: "./assets/movies/genres3.png" },
    { title: "Drama", img: "./assets/movies/genres4.png" },
    { title: "Horror", img: "./assets/movies/genres1.png" },
    { title: "Romance", img: "./assets/movies/genres2.png" },
    { title: "Sci-Fi", img: "./assets/movies/genres3.png" },
    { title: "Documentary", img: "./assets/movies/genres4.png" }
];

const release = [
    { title: "Released at 22 April 2025", img: "./assets/movies/new-releases1.png" },
    { title: "Released at 22 April 2025", img: "./assets/movies/new-releases2.png" },
    { title: "Released at 22 April 2025", img: "./assets/movies/new-releases3.png" },
    { title: "Released at 22 April 2025", img: "./assets/movies/new-releases4.png" },
    { title: "Released at 22 April 2025", img: "./assets/movies/new-releases5.png" },
    { title: "Released at 22 April 2025", img: "./assets/movies/new-releases1.png" },
    { title: "Released at 22 April 2025", img: "./assets/movies/new-releases2.png" },
    { title: "Released at 22 April 2025", img: "./assets/movies/new-releases4.png" }
];

const mustWatch = [
    { title: "1h30min", defaultValue: 4.5, img: "./assets/movies/must-watch1.png" },
    { title: "1h30min", defaultValue: 4, img: "./assets/movies/must-watch2.png" },
    { title: "1h30min", defaultValue: 4.5, img: "./assets/movies/must-watch3.png" },
    { title: "1h30min", defaultValue: 4, img: "./assets/movies/must-watch4.png" },
    { title: "1h30min", defaultValue: 4, img: "./assets/movies/must-watch3.png" },
    { title: "1h30min", defaultValue: 4.5, img: "./assets/movies/must-watch1.png" },
    { title: "1h30min", defaultValue: 4, img: "./assets/movies/must-watch2.png" },
    { title: "1h30min", defaultValue: 4.5, img: "./assets/movies/must-watch4.png" }
];

const SectionSlider = ({ title, description, data, showTag, slidesToShow = 4 }) => {
    const [Sliders, setSliders] = useState([]);

    useEffect(() => {
        setSliders(data);
    }, [data]);

    const settings = {
        dots: false,
        infinite: true,
        arrows: false,
        autoplay: true,
        autoplaySpeed: 3000,
        pauseOnHover: false,
        speed: 500,
        slidesToShow: slidesToShow,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    arrows: false,
                    dots: true,
                    autoplay: true,
                    autoplaySpeed: 3000,
                    pauseOnHover: false
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    arrows: false,
                    dots: true,
                    autoplay: true,
                    autoplaySpeed: 3000,
                    pauseOnHover: false
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    arrows: false,
                    dots: true,
                    autoplay: true,
                    autoplaySpeed: 3000,
                    pauseOnHover: false
                }
            }
        ]
    };

    return (
        <div className="mb-12">
            <div className="text-center mb-8">
                <h2 
                    className="text-3xl md:text-4xl font-bold mb-3"
                    style={{
                        background: "linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                    }}
                >
                    {title}
                </h2>
                <p className="text-gray-300 text-lg">{description}</p>
            </div>

            <Slider ref={sliderRef} {...settings}>
                {Sliders.map((item, index) => (
                    <div key={index} className="p-2 cursor-pointer">
                        <Link to={`/moviedetails/${item._id}`}>
                            <div 
                                className="text-white rounded-xl overflow-hidden p-2 relative shadow-lg transition-all duration-300 transform hover:scale-105"
                                style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    backdropFilter: "blur(20px)",
                                    border: "1px solid rgba(255, 255, 255, 0.2)",
                                    boxShadow: "0 8px 25px rgba(0,0,0,0.25)"
                                }}
                            >
                                <img
                                    src={item?.thumbnail || item.thumbnail}
                                    className="rounded w-full h-[300px] object-cover"
                                    alt={item.name}
                                />
                                <div className="flex mt-2 justify-between items-center">
                                    <span className="text-base">{item.name}</span>
                                    <ArrowForwardIosIcon fontSize="small" />
                                </div>
                                {showTag && (
                                    <div 
                                        className="absolute top-2 left-2 text-white px-2 py-1 rounded text-xs font-bold"
                                        style={{
                                            background: "linear-gradient(45deg, #ff6b6b, #4ecdc4)"
                                        }}
                                    >
                                        Top 10
                                    </div>
                                )}
                            </div>
                        </Link>
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default function MovieScreen() {
    const sliderRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [allMovies, setAllMovies] = useState([]);

    // Temporary static data for all movies
    const staticMovies = [
        {
            title: 'Avengers: Endgame',
            img: './assets/endgame-banner.png',
            thumbnail: './assets/endgame-banner.png',
        },
        {
            title: 'Kantara',
            img: './assets/movie-details/movie-poster.png',
            thumbnail: './assets/movie-details/movie-poster.png',
        },
        {
            title: 'Inception',
            img: './assets/movies/trending1.png',
            thumbnail: './assets/movies/trending1.png',
        },
        {
            title: 'Interstellar',
            img: './assets/movies/trending2.png',
            thumbnail: './assets/movies/trending2.png',
        },
        {
            title: 'The Dark Knight',
            img: './assets/movies/trending3.png',
            thumbnail: './assets/movies/trending3.png',
        },
        {
            title: 'Joker',
            img: './assets/movies/trending4.png',
            thumbnail: './assets/movies/trending4.png',
        },
        {
            title: 'Tenet',
            img: './assets/movies/trending5.png',
            thumbnail: './assets/movies/trending5.png',
        },
        {
            title: 'Pushpa',
            img: './assets/movies/must-watch1.png',
            thumbnail: './assets/movies/must-watch1.png',
        },
        {
            title: 'KGF',
            img: './assets/movies/must-watch2.png',
            thumbnail: './assets/movies/must-watch2.png',
        },
    ];

    const settings = {
        dots: false,
        infinite: true,
        arrows: false,
        autoplay: true,
        autoplaySpeed: 2000,
        pauseOnHover: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        afterChange: index => setCurrentIndex(index),
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    arrows: false,
                    dots: true,
                    autoplay: true,
                    autoplaySpeed: 1000,
                    pauseOnHover: false
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    arrows: false,
                    dots: true,
                    autoplay: true,
                    autoplaySpeed: 2000,
                    pauseOnHover: false
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    arrows: false,
                    dots: true,
                    autoplay: true,
                    autoplaySpeed: 2000,
                    pauseOnHover: false
                }
            }
        ]
    };

    useEffect(() => {
        setAllMovies(staticMovies);
    }, []);

    return (
        <div 
            className='MovieScreen mt-20 pt-8'
            style={{
                background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
                minHeight: "100vh"
            }}
        >
            <div 
                className="relative w-full max-w-7xl mx-auto rounded-xl shadow-lg p-4 md:p-8"
                style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 25px 50px rgba(0,0,0,0.25)"
                }}
            >
                <Slider ref={sliderRef} {...settings}>
                    {slides.map((slide, i) => (
                        <div key={i} className="relative">
                            <img src={slide.img} alt={slide.title} className="w-full h-[400px] md:h-[500px] object-cover rounded-xl" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col items-center justify-center px-4">
                                <h2 className='text-3xl md:text-5xl font-bold text-center text-white mb-4'>{slide.title}</h2>
                                <p className='hidden md:block text-lg text-gray-200 text-center mb-6'>{slide.description}</p>
                                <div className="flex flex-col md:flex-row gap-4 items-center">
                                    <button 
                                        className="flex items-center gap-2 text-white px-6 py-2 rounded-full font-semibold text-lg shadow transition-all duration-300 transform hover:scale-105"
                                        style={{
                                            background: "linear-gradient(45deg, #ff6b6b, #4ecdc4)",
                                            boxShadow: "0 8px 25px rgba(255,107,107,0.3)"
                                        }}
                                    >
                                        <PlayArrowIcon /> Play Now
                                    </button>
                                    <div className='flex gap-2'>
                                        <button 
                                            className="p-2 rounded-full transition-all duration-300 hover:scale-110"
                                            style={{
                                                background: "rgba(0, 0, 0, 0.7)",
                                                color: "white"
                                            }}
                                        >
                                            <AddIcon />
                                        </button>
                                        <button 
                                            className="p-2 rounded-full transition-all duration-300 hover:scale-110"
                                            style={{
                                                background: "rgba(0, 0, 0, 0.7)",
                                                color: "white"
                                            }}
                                        >
                                            <ThumbUpOffAltIcon />
                                        </button>
                                        <button 
                                            className="p-2 rounded-full transition-all duration-300 hover:scale-110"
                                            style={{
                                                background: "rgba(0, 0, 0, 0.7)",
                                                color: "white"
                                            }}
                                        >
                                            <VolumeOffIcon />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </Slider>
                
                {/* Custom Arrows */}
                <button 
                    className="absolute top-1/2 left-4 -translate-y-1/2 z-10 p-2 rounded-full transition-all duration-300 hover:scale-110" 
                    onClick={() => sliderRef.current.slickPrev()}
                    style={{
                        background: "rgba(0, 0, 0, 0.7)",
                        color: "white"
                    }}
                >
                    <ArrowBackIosNewIcon />
                </button>
                <button 
                    className="absolute top-1/2 right-4 -translate-y-1/2 z-10 p-2 rounded-full transition-all duration-300 hover:scale-110" 
                    onClick={() => sliderRef.current.slickNext()}
                    style={{
                        background: "rgba(0, 0, 0, 0.7)",
                        color: "white"
                    }}
                >
                    <ArrowForwardIosIcon />
                </button>
                
                {/* Custom Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                    {slides.map((_, i) => (
                        <span 
                            key={i} 
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${currentIndex === i ? 'scale-125' : ''}`}
                            style={{
                                backgroundColor: currentIndex === i ? '#ff6b6b' : '#666'
                            }}
                        />
                    ))}
                </div>
            </div>
            
            <div className="max-w-7xl mx-auto mt-12">
                <SectionSlider
                    title="All Movies"
                    description="Browse all available movies."
                    data={allMovies}
                    slidesToShow={5}
                />
            </div>
        </div>
    );
}


interface WeatherResponse {
    name: string;
    main: {
        temp: number;
        humidity: number;
    };
    weather: Array<{
        description: string;
        icon: string;
    }>;
    wind: {
        speed: number;
    };
    message?: string;
}

interface ForecastResponse {
    list: Array<{
        dt: number;
        main: {
            temp: number;
            humidity: number;
        };
        weather: Array<{
            description: string;
            icon: string;
        }>;
        wind: {
            speed: number;
        };
    }>;
    message?: string;
}

export type { WeatherResponse, ForecastResponse }; 
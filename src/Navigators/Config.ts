import Login from "@Containers/Auth/Login";
import HomeScreen from "@Containers/Tab/HomeScreen";
import PortableSensorScreen from "@Containers/Tab/PortableSensorScreen";
import RouteName from "src/Constants/RouteName.constants";

interface ISCreen {
    name: string;
    component: React.ComponentType<any>;
    options: any;
}

export const UnauthorizedScreens: ISCreen[] = [
    {
        name: RouteName.LoginNavigation,
        component: Login,
        options: {
            headerShown: false,
        },
    }
]

export const AuthorizedScreens: ISCreen[] = [
    {
        name: RouteName.HomeScreenNavigation,
        component: HomeScreen,
        options: {
            headerShown: false,
        },
    },
    {
        name: RouteName.PortableSensorScreenNavigation,
        component: PortableSensorScreen,
        options: {
            headerShown: false,
        },
    },
    {
        name: RouteName.ChartScreenNavigation,
        component: PortableSensorScreen,
        options: {
            headerShown: false,
        },
    },
]
import RouteName from "./RouteName.constants";

export type RootStackParamList = {
  [RouteName.LoginNavigation]: undefined;
  [RouteName.HomeScreenNavigation]: undefined;
//   [RouteName.PortableSensorScreenNavigation]: {
//     portableData?: any; // ubah dari PortableData ke portableData (camelCase)
//     isHistoryMode?: boolean;
//     bleStatus?: 'scanning' | 'connecting' | 'connected' | 'disconnected';
//     sensorData?: any;
//   };
  [RouteName.ChartScreenNavigation]: undefined;
  [RouteName.DetailBlockNavigation]: {
    blockId: any;
    from?: 'HomeFix' | 'AllBlock';
  };
  [RouteName.ListBlockScreenNavigation]: undefined;
  [RouteName.ListPortableScreenNavigation]: undefined;
  [RouteName.SplashScreenNavigation]: undefined;
  [RouteName.TabNavigation]: undefined;
}
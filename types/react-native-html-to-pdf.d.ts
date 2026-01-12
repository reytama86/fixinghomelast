declare module 'react-native-html-to-pdf' {
  export interface Options {
    html: string;
    fileName: string;
    directory?: string;
    base64?: boolean;
    width?: number;
    height?: number;
    padding?: number;
    bgColor?: string;
  }

  export interface File {
    filePath?: string;
    base64?: string;
  }

  export function convert(options: Options): Promise<File>;
}
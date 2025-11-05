import type { AxiosInstance } from "axios";

declare module "@/lib/axios" {
  export const axiosInstance: AxiosInstance;
}

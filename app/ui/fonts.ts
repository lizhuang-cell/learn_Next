// 字体配置
import { Lusitana, Inter } from "next/font/google";

// 字体设置
export const inter = Inter({ subsets: ["latin"] });

export const lusitana = Lusitana({
  subsets: ["latin"],
  weight: ["400", "700"]
});